"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./ChatBubble";
import { ChatMessage } from "@/stores/chatbotStore";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  const endRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (!endRef.current) return;
    const behavior: ScrollBehavior = isStreaming ? "auto" : "smooth";
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-accent-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("chatbot_welcome_title")}</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          {t("chatbot_welcome_message")}
        </p>
        <div className="mt-6 space-y-2 w-full max-w-[280px]">
          <p className="text-xs text-muted-foreground font-medium">
            {t("chatbot_suggestions_title")}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              t("chatbot_suggestion_1"),
              t("chatbot_suggestion_2"),
              t("chatbot_suggestion_3"),
            ].map((suggestion, index) => (
              <span
                key={index}
                className="text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            message={message}
            isStreaming={
              isStreaming &&
              index === messages.length - 1 &&
              message.role === "assistant"
            }
          />
        ))}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
