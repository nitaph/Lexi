import { MessageType, AgentType } from "@models/AppModels";
import { ApiPaths } from "../constants";
import axiosInstance from "./AxiosInstance";
import { buildSystemPromptWithPersonality } from "@utils/promptBuilder";

const serialize = (obj: any) =>
  Object.keys(obj)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          typeof obj[key] === "string"
            ? obj[key].replace(/\n/g, "\\n")
            : obj[key]
        )}`
    )
    .join("&");

export const sendMessage = async (
  message: MessageType,
  conversationId: string
): Promise<MessageType> => {
  const response = await axiosInstance.post(
    `/${ApiPaths.CONVERSATIONS_PATH}/${conversationId}/message`,
    { content: message.content }
  );
  return response.data;
};

/**
 * Sends a streaming message to the backend with dynamic system prompt injection
 */
export const sendStreamMessage = async (
  message: MessageType,
  conversationId: string,
  agent: AgentType,
  userId: string,
  onMessageReceived: (message: string) => void,
  onCloseStream: (message: MessageType) => void,
  onError: (error?: Event | { code: number; message: string }) => void
) => {
  try {
    // ✅ Inject runtime personality prompt based on agent and user
    const dynamicPrompt = await buildSystemPromptWithPersonality(agent, userId);

    const messageWithPrompt = {
      ...message,
      systemStarterPrompt: dynamicPrompt,
    };

    const eventSource = new EventSource(
      `${process.env.REACT_APP_API_URL}/$${
        ApiPaths.CONVERSATIONS_PATH
      }/message/stream?${serialize(
        messageWithPrompt
      )}&conversationId=${conversationId}`
    );

    eventSource.addEventListener("close", (event) => {
      console.log("Server is closing the connection.");
      const message = JSON.parse(event.data);
      onCloseStream(message);
      eventSource.close();
    });

    eventSource.onmessage = (event) => {
      if (!event.data.trim()) return;

      const data = JSON.parse(event.data);

      if (data.error) {
        if (onError) onError(data.error);
        eventSource.close();
        return;
      }

      onMessageReceived(data.message);
    };

    eventSource.onerror = (error) => {
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("Connection was closed normally.");
      } else if (onError) {
        onError(error);
      }
      eventSource.close();
    };
  } catch (err) {
    console.error("Error in sendStreamMessage:", err);
    if (onError) onError({ code: 500, message: "Failed to stream message" });
  }
};

export const createConversation = async (
  userId: string,
  numberOfConversations: number,
  experimentId: string
): Promise<string> => {
  const response = await axiosInstance.post(`/${ApiPaths.CONVERSATIONS_PATH}`, {
    userId,
    numberOfConversations,
    experimentId,
  });
  return response.data.conversationId;
};

export const getConversation = async (
  conversationId: string
): Promise<MessageType[]> => {
  try {
    const response = await axiosInstance.get(
      `/${ApiPaths.CONVERSATIONS_PATH}/conversation?conversationId=${conversationId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateConversationMetadata = async (
  conversationId: string,
  data: object,
  isPreConversation: boolean
): Promise<void> => {
  try {
    await axiosInstance.put(`/${ApiPaths.CONVERSATIONS_PATH}/metadata`, {
      conversationId,
      data,
      isPreConversation,
    });
    return;
  } catch (error) {
    throw error;
  }
};

export const finishConversation = async (
  conversationId: string,
  experimentId: string,
  isAdmin: boolean
): Promise<void> => {
  try {
    await axiosInstance.patch(
      `/${ApiPaths.CONVERSATIONS_PATH}/${conversationId}/finish`,
      { experimentId, isAdmin }
    );
  } catch (error) {
    throw error;
  }
};

export const updateUserAnnotation = async (
  messageId: string,
  userAnnotation: number
): Promise<void> => {
  try {
    await axiosInstance.put(`/${ApiPaths.CONVERSATIONS_PATH}/annotation`, {
      messageId,
      userAnnotation,
    });
    return;
  } catch (error) {
    throw error;
  }
};
