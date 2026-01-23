"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/stores/chatbotStore";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function ChatBubble({ message, isStreaming }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                // Custom components for markdown
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="bg-background/50 px-1 py-0.5 rounded text-xs">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content || " "}
            </ReactMarkdown>
            {/* Typing indicator */}
            {isStreaming && !message.content && (
              <div className="flex gap-1 py-1">
                <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
