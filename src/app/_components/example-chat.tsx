/**
 * Example Chat Component
 *
 * Demonstrates the React Query → API wrapper → Route Handler → Use Case flow.
 */

"use client";

import { useState } from "react";
import { useSendMessageStream } from "@/lib/api/queries/useChat";
import { createChatMessage } from "@/lib/chat-utils";
import type { Message } from "@/core/domain/message.entity";

export function ExampleChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const { mutateAsync: sendMessage, isPending: isLoading } =
    useSendMessageStream();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setStreamingResponse("");

    const userMessage = createChatMessage("user", input);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await sendMessage({
        messages: updatedMessages,
        options: {
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      if (!response.body) {
        throw new Error("Response body is not readable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        fullResponse += decoder.decode(value, { stream: true });
        setStreamingResponse(fullResponse);
      }

      const assistantMessage = createChatMessage("assistant", fullResponse);
      setMessages([...updatedMessages, assistantMessage]);
      setStreamingResponse("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            <div className="font-semibold mb-1">
              {message.role === "user" ? "You" : "AI"}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}

        {streamingResponse && (
          <div className="p-4 rounded-lg bg-gray-100 mr-auto max-w-[80%]">
            <div className="font-semibold mb-1">AI</div>
            <div className="whitespace-pre-wrap">{streamingResponse}</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
