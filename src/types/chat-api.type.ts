import type { Message } from "@/core/domain/message.entity";
import type { AIGenerateOptions } from "@/core/ports/ai-gateway.port";

export interface PostChatMessageRequest {
  messages: Message[];
  options?: AIGenerateOptions;
}

export interface PostChatMessageResponse {
  response: string;
}
