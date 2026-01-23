"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isStreaming, placeholder }: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isStreaming) {
      onSend(value.trim());
      setValue("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end p-4 border-t bg-background">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("chatbot_input_placeholder")}
          rows={1}
          className={cn(
            "w-full resize-none rounded-2xl border border-input bg-muted px-4 py-3 pr-12",
            "text-sm placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "max-h-[120px] min-h-[48px]"
          )}
        />
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || isStreaming}
        className="h-12 w-12 rounded-full flex-shrink-0"
      >
        {isStreaming ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
