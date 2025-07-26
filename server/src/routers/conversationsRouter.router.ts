import { Router } from "express";
import { conversationsController } from "../controllers/conversationsController.controller";

export const conversationsRouter = () => {
  const router = Router();

  // Create a new conversation
  // POST /api/conversations
  router.post("/", conversationsController.createConversation);

  // Send a user message
  // POST /api/conversations/:conversationId/message
  router.post("/:conversationId/message", conversationsController.sendMessage);

  // Save post-conversation survey answers
  // POST /api/conversations/:conversationId/survey
  router.post("/:conversationId/survey", conversationsController.saveSurvey);

  // GET /api/conversations/:conversationId
  router.get("/:conversationId", conversationsController.getConversationById);

  // Get all conversations and metadata for a user
  // GET /api/conversations/user/:userId
  router.get("/user/:userId", conversationsController.getUserConversations);

  // Finish a conversation
  // PATCH /api/conversations/:conversationId/finish
  router.patch("/:conversationId/finish", conversationsController.finish);

  // Update pre‐ or post‐conversation survey
  // PUT /api/conversations/metadata
  router.put("/metadata", conversationsController.updateMetadata);

  return router;
};
