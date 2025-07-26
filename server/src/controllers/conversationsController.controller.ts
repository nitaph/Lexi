import { Request, Response } from "express";
import { requestHandler } from "../utils/requestHandler";
import { ConversationsService } from "../services/conversations.service";
import { Message } from "../types";
import { SurveyAnswers } from "../types/IMetadataConversation.type";

const conversationsService = new ConversationsService();

export class ConversationsController {
  /**
   * POST /conversations
   * Create a new conversation for a user in an experiment.
   */
  createConversation = requestHandler(async (req: Request, res: Response) => {
    const { userId, numberOfConversations, experimentId } = req.body as {
      userId: string;
      numberOfConversations: number;
      experimentId: string;
    };
    const conversationId = await conversationsService.createConversation(
      userId,
      numberOfConversations,
      experimentId
    );
    res.status(201).json({ conversationId });
  });

  /**
   * POST /conversations/:conversationId/message
   * Wraps incoming content into a Message with a literal role 'user'.
   */
  sendMessage = requestHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;
    const { content } = req.body as { content: string };
    const message: Message = { role: "user", content };
    const saved = await conversationsService.message(message, conversationId);
    res.status(200).json(saved);
  });

  /**
   * POST /conversations/:conversationId/survey
   * Persists post-conversation survey answers (fields 1–50) in metadata.
   */
  saveSurvey = requestHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;
    const answers = req.body as SurveyAnswers;
    await conversationsService.updateConversationSurveysData(
      conversationId,
      answers,
      false
    );
    res.status(200).json({ message: "Survey saved successfully." });
  });

  /**
   * GET /conversations/user/:userId
   * Retrieves all conversations and metadata for a user.
   */
  getUserConversations = requestHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const data = await conversationsService.getUserConversations(userId);
    res.status(200).json(data);
  });

  getConversationById = requestHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;
    const messages = await conversationsService.getConversation(
      conversationId,
      false
    );
    res.status(200).json(messages);
  });

  /**
   * PATCH /conversations/:conversationId/finish
   * Marks a conversation finished and closes session if applicable.
   */
  finish = requestHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;
    const { experimentId, isAdmin } = req.body as {
      experimentId: string;
      isAdmin: boolean;
    };
    await conversationsService.finishConversation(
      conversationId,
      experimentId,
      isAdmin
    );
    res.status(200).json({ message: "Conversation finished." });
  });

  updateMetadata = requestHandler(async (req: Request, res: Response) => {
    const { conversationId, data, isPreConversation } = req.body as {
      conversationId: string;
      data: object;
      isPreConversation: boolean;
    };
    await conversationsService.updateConversationSurveysData(
      conversationId,
      data as any,
      isPreConversation
    );
    res.status(200).json({ message: "Metadata updated." });
  });
}

export const conversationsController = new ConversationsController();
