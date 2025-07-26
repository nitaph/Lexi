// conversations.service.ts

import dotenv from "dotenv";
import mongoose from "mongoose";
import { IAgent, Message, UserAnnotation } from "../types";
import { ConversationsModel } from "../models/ConversationsModel";
import { experimentsService } from "./experiments.service";
import { usersService } from "./users.service";
import OpenAI from "openai";
import { ChatCompletionCreateParams } from "openai/resources/chat";
import { SurveyAnswers } from "../types/IMetadataConversation.type";
import { MetadataConversationsModel } from "../models/MetadataConversationsModel";
import { UsersModel } from "../models/UsersModel";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Server is not configured with OpenAI API key");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function buildSystemPromptWithPersonality(agent: IAgent): string {
  if (agent.promptTemplate) {
    return agent.promptTemplate;
  }
  const traits = [
    `openness: ${agent.openness ?? "?"} /50`,
    `conscientiousness: ${agent.conscientiousness ?? "?"} /50`,
    `extraversion: ${agent.extraversion ?? "?"} /50`,
    `agreeableness: ${agent.agreeableness ?? "?"} /50`,
    `neuroticism: ${agent.neuroticism ?? "?"} /50`,
  ];
  return `You are an assistant with the following Big Five traits: ${traits.join(", ")}. Respond accordingly.`;
}

export class ConversationsService {
  async createConversation(
    userId: string,
    userConversationsNumber: number,
    experimentId: string
  ): Promise<string> {
    // Fetch a full Mongoose document for the user, and the experiment bounds
    const [user, bounds] = await Promise.all([
      usersService.getUserById(userId),
      experimentsService.getExperimentBoundries(experimentId),
    ]);

    if (
      !user.isAdmin &&
      bounds.maxConversations &&
      userConversationsNumber + 1 > bounds.maxConversations
    ) {
      const err = new Error("Conversations limit exceeded");
      (err as any).code = 403;
      throw err;
    }

    const agent: IAgent = user.isAdmin
      ? await experimentsService.getActiveAgent(experimentId)
      : user.agent;

    // 1) Create the conversation metadata doc
    const record = await MetadataConversationsModel.create({
      conversationNumber: userConversationsNumber + 1,
      experimentId,
      userId,
      agent,
      maxMessages: user.isAdmin ? undefined : bounds.maxMessages,
    });

    // 2) Send the first assistant message & bump counters
    const firstMsg: Message = {
      role: "assistant",
      content: agent.firstChatSentence,
    };
    await Promise.all([
      this.createMessageDoc(firstMsg, record._id.toString(), 1),
      usersService.addConversation(userId),
      !user.isAdmin && experimentsService.addSession(experimentId),
    ]);

    // 3) Persist LLM Big-Five onto the user under metadata.postConversation
    if (agent.personalityStrategy && typeof agent.openness === "number") {
      await UsersModel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        {
          $set: {
            "metadata.postConversation.llmPersonality": {
              strategy: agent.personalityStrategy,
              openness: agent.openness,
              conscientiousness: agent.conscientiousness,
              extraversion: agent.extraversion,
              agreeableness: agent.agreeableness,
              neuroticism: agent.neuroticism,
            },
          },
        }
      );
    }

    return record._id.toString();
  }

  async getConversation(
    conversationId: string,
    lean = false
  ): Promise<Message[]> {
    const projection = lean
      ? { _id: 0, role: 1, content: 1 }
      : { _id: 1, role: 1, content: 1, userAnnotation: 1 };
    return ConversationsModel.find({ conversationId }, projection).lean();
  }

  async deleteExperimentConversations(experimentId: string): Promise<void> {
    await MetadataConversationsModel.deleteMany({ experimentId });
    await ConversationsModel.deleteMany({ experimentId });
  }

  async message(
    message: Message,
    conversationId: string,
    streamResponse?: (chunk: string) => Promise<void>
  ): Promise<Message> {
    const [conversation, metadata] = await Promise.all([
      this.getConversation(conversationId, true),
      this.getConversationMetadata(conversationId),
    ]);

    if (
      metadata.maxMessages &&
      metadata.messagesNumber + 1 > metadata.maxMessages
    ) {
      const err = new Error("Message limit exceeded");
      (err as any).code = 403;
      throw err;
    }

    const messages = this.getConversationMessages(
      metadata.agent,
      conversation,
      message
    );

    const chatRequest: ChatCompletionCreateParams = {
      model: metadata.agent.model,
      messages,
      ...(metadata.agent.maxTokens && { max_tokens: metadata.agent.maxTokens }),
      ...(metadata.agent.temperature && {
        temperature: metadata.agent.temperature,
      }),
      ...(metadata.agent.topP && { top_p: metadata.agent.topP }),
      ...(metadata.agent.frequencyPenalty && {
        frequency_penalty: metadata.agent.frequencyPenalty,
      }),
      ...(metadata.agent.presencePenalty && {
        presence_penalty: metadata.agent.presencePenalty,
      }),
      ...(metadata.agent.stopSequences && {
        stop: metadata.agent.stopSequences,
      }),
    };

    await this.createMessageDoc(
      message,
      conversationId,
      conversation.length + 1
    );

    let assistantContent = "";

    if (!streamResponse) {
      const response = await openai.chat.completions.create(chatRequest);
      assistantContent = response.choices[0].message.content?.trim() || "";
    } else {
      const streamParams = { ...chatRequest, stream: true };
      const responseStream = await openai.chat.completions.create(streamParams);
      for await (const part of responseStream as any) {
        const chunk = part.choices[0].delta?.content || "";
        if (chunk) {
          await streamResponse(chunk);
          assistantContent += chunk;
        }
      }
    }

    const saved = await this.createMessageDoc(
      { role: "assistant", content: assistantContent },
      conversationId,
      conversation.length + 2
    );

    await this.updateConversationMetadata(conversationId, {
      $inc: { messagesNumber: 1 },
      $set: { lastMessageDate: new Date(), lastMessageTimestamp: Date.now() },
    });

    return saved;
  }

  async updateConversationSurveysData(
    conversationId: string,
    answers: SurveyAnswers,
    isPreConversation = false
  ): Promise<void> {
    const field = isPreConversation ? "preConversation" : "postConversation";
    await MetadataConversationsModel.updateOne(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      { $set: { [field]: answers } },
      { runValidators: true }
    );
  }

  async getConversationMetadata(conversationId: string): Promise<any> {
    return MetadataConversationsModel.findById(
      new mongoose.Types.ObjectId(conversationId)
    );
  }

  async getUserConversations(
    userId: string
  ): Promise<{ metadata: any; conversation: Message[] }[]> {
    const metas = await MetadataConversationsModel.find(
      { userId },
      { agent: 0 }
    ).lean();
    const results: { metadata: any; conversation: Message[] }[] = [];
    for (const meta of metas) {
      const convo = await ConversationsModel.find({
        conversationId: meta._id.toString(),
      }).lean();
      results.push({ metadata: meta, conversation: convo });
    }
    return results;
  }

  async finishConversation(
    conversationId: string,
    experimentId: string,
    isAdmin: boolean
  ): Promise<void> {
    const res = await MetadataConversationsModel.updateOne(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      { $set: { isFinished: true } }
    );
    if (res.modifiedCount && !isAdmin) {
      await experimentsService.closeSession(experimentId);
    }
  }

  private async updateConversationMetadata(
    conversationId: string,
    fields: Record<string, any>
  ) {
    return MetadataConversationsModel.updateOne(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      fields
    );
  }

  private getConversationMessages(
    agent: IAgent,
    conversation: Message[],
    userMessage: Message
  ): Message[] {
    const system: Message = {
      role: "system",
      content: buildSystemPromptWithPersonality(agent),
    };
    const before: Message = {
      role: "system",
      content: agent.beforeUserSentencePrompt,
    };
    const after: Message = {
      role: "system",
      content: agent.afterUserSentencePrompt,
    };
    return [system, ...conversation, before, userMessage, after];
  }

  private createMessageDoc = async (
    message: Message,
    conversationId: string,
    messageNumber: number
  ): Promise<Message> => {
    const res = await ConversationsModel.create({
      content: message.content,
      role: message.role,
      conversationId,
      messageNumber,
    });
    return {
      _id: res._id,
      role: res.role,
      content: res.content,
      userAnnotation: res.userAnnotation,
    };
  };

  private async getExperimentConversationsIds(
    experimentId: string
  ): Promise<{ ids: mongoose.Types.ObjectId[]; strIds: string[] }> {
    const [result] = await MetadataConversationsModel.aggregate([
      { $match: { experimentId } },
      { $project: { _id: 1, id: { $toString: "$_id" } } },
      {
        $group: { _id: null, ids: { $push: "$_id" }, strIds: { $push: "$id" } },
      },
      { $project: { _id: 0, ids: 1, strIds: 1 } },
    ]);
    return result;
  }
}

export const conversationsService = new ConversationsService();
