"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatbotState {
  messages: ChatMessage[];
  summary: string;
  isOpen: boolean;
}

interface ChatbotActions {
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, content: string) => void;
  appendToMessage: (id: string, content: string) => void;
  clearChat: () => void;
  setSummary: (summary: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  getContext: () => { lastMessages: ChatMessage[]; summary: string };
}

type ChatbotStore = ChatbotState & ChatbotActions;

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/**
 * Generate a simple summary from messages beyond the last 5
 * This is a client-side approach - for more sophisticated summaries,
 * we could call the backend to summarize using LLM
 */
const generateClientSummary = (messages: ChatMessage[]): string => {
  if (messages.length <= 5) return "";
  
  // Get messages beyond the last 5
  const olderMessages = messages.slice(0, -5);
  
  // Create a simple summary by extracting key topics
  const userQuestions = olderMessages
    .filter(m => m.role === "user")
    .map(m => m.content.slice(0, 100))
    .slice(-3); // Last 3 user questions from older messages
  
  if (userQuestions.length === 0) return "";
  
  return `Previous topics discussed: ${userQuestions.join("; ")}`;
};

export const useChatbotStore = create<ChatbotStore>()(
  persist(
    (set, get) => ({
      // State
      messages: [],
      summary: "",
      isOpen: false,

      // Actions
      addMessage: (message) => {
        const id = generateId();
        const newMessage: ChatMessage = {
          ...message,
          id,
          timestamp: Date.now(),
        };
        
        set((state) => {
          const newMessages = [...state.messages, newMessage];
          // Auto-generate summary when we have more than 5 messages
          const newSummary = newMessages.length > 5 
            ? generateClientSummary(newMessages)
            : state.summary;
          
          return {
            messages: newMessages,
            summary: newSummary,
          };
        });
        
        return id;
      },

      updateMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          ),
        }));
      },

      appendToMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content: msg.content + content } : msg
          ),
        }));
      },

      clearChat: () => {
        set({
          messages: [],
          summary: "",
        });
      },

      setSummary: (summary) => {
        set({ summary });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      getContext: () => {
        const { messages, summary } = get();
        // Return last 5 messages for context
        const lastMessages = messages.slice(-5);
        return { lastMessages, summary };
      },
    }),
    {
      name: "brokwise-chatbot",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist messages and summary, not UI state like isOpen
        messages: state.messages,
        summary: state.summary,
      }),
    }
  )
);
