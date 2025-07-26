// src/services/dataAggregation.service.ts

import ExcelJS from "exceljs";
import { conversationsService } from "./conversations.service";
import { experimentsService } from "./experiments.service";
import { usersService } from "./users.service";
import PersonalityScores from "../models/PersonalityScores"; // correct relative path

function safeNumber(n: any) {
  return typeof n === "number" && isFinite(n) ? n : "";
}

function personalityToString(p?: { [key: string]: number }) {
  if (!p) return "";
  return (
    `Openness: ${safeNumber(p.openness)}, ` +
    `Conscientiousness: ${safeNumber(p.conscientiousness)}, ` +
    `Extraversion: ${safeNumber(p.extraversion)}, ` +
    `Agreeableness: ${safeNumber(p.agreeableness)}, ` +
    `Neuroticism: ${safeNumber(p.neuroticism)}`
  );
}

const agentsSheetCols = [
  { header: "Number of Participants", key: "numParticipants" },
  { header: "Condition Title", key: "conditionTitle" },
  { header: "Summary", key: "summary" },
  { header: "System Starter Prompt", key: "systemStarterPrompt" },
  { header: "Before User Sentence Prompt", key: "beforeUserSentencePrompt" },
  { header: "After User Sentence Prompt", key: "afterUserSentencePrompt" },
  { header: "First Chat Sentence", key: "firstChatSentence" },
  { header: "Model", key: "model" },
  { header: "Temperature", key: "temperature" },
  { header: "Max Tokens", key: "maxTokens" },
  { header: "Top P", key: "topP" },
  { header: "Frequency Penalty", key: "frequencyPenalty" },
  { header: "Presence Penalty", key: "presencePenalty" },
  { header: "Stop Sequences", key: "stopSequences" },
  { header: "Personality Strategy", key: "personalityStrategy" },
  { header: "Agent Openness", key: "openness" },
  { header: "Agent Conscientiousness", key: "conscientiousness" },
  { header: "Agent Extraversion", key: "extraversion" },
  { header: "Agent Agreeableness", key: "agreeableness" },
  { header: "Agent Neuroticism", key: "neuroticism" },
];

const usersSheetCols = [
  { header: "Agent", key: "agent" },
  { header: "Username", key: "username" },
  { header: "Number of Conversations", key: "numberOfConversations" },
  { header: "Age", key: "age" },
  { header: "Gender", key: "gender" },
  { header: "Created At", key: "createdAt" },
  { header: "Openness", key: "openness" },
  { header: "Conscientiousness", key: "conscientiousness" },
  { header: "Extraversion", key: "extraversion" },
  { header: "Agreeableness", key: "agreeableness" },
  { header: "Neuroticism", key: "neuroticism" },
];

const convSheetCols = [
  { header: "Conversation ID", key: "id" },
  { header: "Agent", key: "agent" },
  { header: "User", key: "username" },
  { header: "Conversation Number", key: "conversationNumber" },
  { header: "Number Of Messages", key: "messagesNumber" },
  { header: "Created At", key: "createdAt" },
  { header: "Last Message Date", key: "lastMessageDate" },
  { header: "Finished", key: "isFinished" },
  { header: "Human Personality", key: "humanPersonality" },
  { header: "LLM Personality", key: "llmPersonality" },
];

const msgSheetCols = [
  { header: "Conversation ID", key: "conversationId" },
  { header: "Message ID", key: "messageId" },
  { header: "Agent", key: "agent" },
  { header: "User", key: "username" },
  { header: "Conversation Number", key: "conversationNumber" },
  { header: "Message Number", key: "messageNumber" },
  { header: "Role", key: "role" },
  { header: "User Annotation", key: "userAnnotation" },
  { header: "Content", key: "content" },
  { header: "Created At", key: "createdAt" },
];

class DataAggregationService {
  async getExperimentData(experimentId: string) {
    const [experimentUsers, experiment] = await Promise.all([
      usersService.getExperimentUsers(experimentId),
      experimentsService.getExperiment(experimentId),
    ]);

    const agents: any[] = [];
    let totalUsers = 0;

    for (const group of experimentUsers) {
      totalUsers += group.data.length;
      const persons: any[] = [];
      for (const user of group.data) {
        const convs = await conversationsService.getUserConversations(user._id);
        persons.push({
          numberOfConversations: user.numberOfConversations,
          user,
          conversations: convs,
        });
      }
      agents.push({
        numberOfParticipants: group.data.length,
        condition: group.agent,
        data: persons,
      });
    }

    return {
      agentsMode: experiment.agentsMode,
      numberOfParticipants: totalUsers,
      agents,
    };
  }

  async createExperimentDataExcel(experimentId: string) {
    const { agentsMode, numberOfParticipants, agents } =
      await this.getExperimentData(experimentId);
    const workbook = new ExcelJS.Workbook();

    // Create sheets
    const agentsSheet = workbook.addWorksheet("Agents");
    const usersSheet = workbook.addWorksheet("Users");
    const convSheet = workbook.addWorksheet("Conversations");
    const msgSheet = workbook.addWorksheet("Messages");

    // Set columns
    agentsSheet.columns = agentsSheetCols;
    usersSheet.columns = usersSheetCols;
    convSheet.columns = convSheetCols;
    msgSheet.columns = msgSheetCols;

    // Prepare row arrays
    const agentsRows: any[] = [];
    const usersRows: any[] = [];
    const convRows: any[] = [];
    const msgRows: any[] = [];

    // Populate rows
    for (const agentData of agents) {
      const title = agentData.condition.title;

      // Agents sheet
      agentsRows.push({
        numParticipants: agentData.numberOfParticipants,
        conditionTitle: title,
        summary: agentData.condition.summary,
        systemStarterPrompt: agentData.condition.systemStarterPrompt,
        beforeUserSentencePrompt: agentData.condition.beforeUserSentencePrompt,
        afterUserSentencePrompt: agentData.condition.afterUserSentencePrompt,
        firstChatSentence: agentData.condition.firstChatSentence,
        model: agentData.condition.model,
        temperature: agentData.condition.temperature,
        maxTokens: agentData.condition.maxTokens,
        topP: agentData.condition.topP,
        frequencyPenalty: agentData.condition.frequencyPenalty,
        presencePenalty: agentData.condition.presencePenalty,
        stopSequences: agentData.condition.stopSequences,
        personalityStrategy:
          agentData.condition.personalityStrategy ?? "baseline",
        openness: agentData.condition.openness ?? null,
        conscientiousness: agentData.condition.conscientiousness ?? null,
        extraversion: agentData.condition.extraversion ?? null,
        agreeableness: agentData.condition.agreeableness ?? null,
        neuroticism: agentData.condition.neuroticism ?? null,
      });

      // Users, Conversations & Messages
      for (const person of agentData.data) {
        const user = person.user;

        // HUMAN scores: prefer PersonalityScores collection
        const humanDoc = await PersonalityScores.findOne({
          userId: user._id,
          experimentId,
        }).lean();

        const humanScores = humanDoc
          ? {
              openness: humanDoc.openness,
              conscientiousness: humanDoc.conscientiousness,
              extraversion: humanDoc.extraversion,
              agreeableness: humanDoc.agreeableness,
              neuroticism: humanDoc.neuroticism,
            }
          : {
              openness: user.openness,
              conscientiousness: user.conscientiousness,
              extraversion: user.extraversion,
              agreeableness: user.agreeableness,
              neuroticism: user.neuroticism,
            };

        const humanPersonality = personalityToString(humanScores);

        // Users sheet row
        usersRows.push({
          agent: title,
          username: user.username,
          numberOfConversations: person.numberOfConversations,
          age: user.age,
          gender: user.gender,
          createdAt: user.createdAt,
          openness: humanScores.openness,
          conscientiousness: humanScores.conscientiousness,
          extraversion: humanScores.extraversion,
          agreeableness: humanScores.agreeableness,
          neuroticism: humanScores.neuroticism,
        });

        // Conversations & Messages sheets
        for (const convo of person.conversations) {
          // LLM scores: from the conversation record or default to nulls
          const llmScores = convo.metadata.postConversation?.llmPersonality ?? {
            openness: null,
            conscientiousness: null,
            extraversion: null,
            agreeableness: null,
            neuroticism: null,
          };
          const llmPersonality = personalityToString(llmScores);

          const convoId = convo.metadata._id?.toString() ?? "";
          convRows.push({
            id: convoId,
            agent: title,
            username: user.username,
            conversationNumber: convo.metadata.conversationNumber,
            messagesNumber: convo.metadata.messagesNumber,
            createdAt: convo.metadata.createdAt,
            lastMessageDate: convo.metadata.lastMessageDate,
            isFinished: convo.metadata.isFinished,
            humanPersonality,
            llmPersonality,
          });

          for (const msg of convo.conversation) {
            msgRows.push({
              conversationId: convoId,
              messageId: msg._id,
              agent: title,
              username: user.username,
              conversationNumber: convo.metadata.conversationNumber,
              messageNumber: msg.messageNumber,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt,
              userAnnotation: msg.userAnnotation,
            });
          }
        }
      }
    }

    agentsSheet.addRows(agentsRows);
    usersSheet.addRows(usersRows);
    convSheet.addRows(convRows);
    msgSheet.addRows(msgRows);

    return workbook;
  }
}

export const dataAggregationService = new DataAggregationService();
