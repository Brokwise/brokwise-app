"use client";

import { useState, useCallback, useRef } from "react";
import { firebaseAuth } from "@/config/firebase";
import { useChatbotStore, ChatMessage } from "@/stores/chatbotStore";

interface ChatContext {
  lastMessages: ChatMessage[];
  summary: string;
}

interface UseChatbotReturn {
  sendMessage: (message: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  clearError: () => void;
}

export const useChatbot = (): UseChatbotReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { addMessage, appendToMessage, getContext } = useChatbotStore();

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      // Capture context before adding new messages
      const contextSnapshot = getContext();

      // Add user message
      addMessage({
        role: "user",
        content: message.trim(),
      });

      // Create placeholder for assistant response
      const assistantMessageId = addMessage({
        role: "assistant",
        content: "",
      });

      try {
        // Get auth token
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (!token) {
          throw new Error("Please log in to use the chatbot");
        }

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // Make streaming request
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chatbot/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              message: message.trim(),
              context: {
                lastMessages: contextSnapshot.lastMessages,
                summary: contextSnapshot.summary,
              },
            }),
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to get response");
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream available");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6); // Remove "data: " prefix

              if (data === "[DONE]") {
                // Stream complete
                break;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  // Handle error from stream
                  appendToMessage(assistantMessageId, parsed.error);
                  setError(parsed.error);
                } else if (parsed.content) {
                  // Append content chunk
                  appendToMessage(assistantMessageId, parsed.content);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          // Request was cancelled
          appendToMessage(assistantMessageId, "[Message cancelled]");
        } else {
          const errorMessage =
            err.message || "Something went wrong. Please try again.";
          appendToMessage(assistantMessageId, errorMessage);
          setError(errorMessage);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [addMessage, appendToMessage, getContext, isStreaming]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    isStreaming,
    error,
    clearError,
  };
};
