import { apiClient } from "./apiClient";
import type {
  PostChatMessageRequest,
  PostChatMessageResponse,
} from "@/types/chat-api.type";

export const chatApi = {
  sendMessageComplete: async (
    data: PostChatMessageRequest,
  ): Promise<PostChatMessageResponse> => {
    return apiClient.post("/api/chat", {
      ...data,
      stream: false,
    }) as Promise<PostChatMessageResponse>;
  },

  sendMessageStream: async (
    data: PostChatMessageRequest,
  ): Promise<Response> => {
    const baseUrl = apiClient.defaults.baseURL ?? "";
    const url = `${baseUrl}/api/chat`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ...data, stream: true }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(payload?.error ?? "Failed to send message");
    }

    return response;
  },
};
