import { cn } from "@/lib/utils";
import { Message } from "@/models/types/chat";
import { format } from "date-fns";
import { FileIcon, ExternalLink } from "lucide-react";
import Image from "next/image";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
  const renderContent = () => {
    if (message.type === "image" && message.mediaUrl) {
      return (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-xl">
            {/* Using regular img tag for now to avoid Next.js Image configuration issues with external domains if not configured */}
            <img
              src={message.mediaUrl}
              alt="Sent image"
              className="h-auto max-h-[300px] w-auto max-w-full rounded-xl object-contain"
              loading="lazy"
            />
          </div>
          {message.content && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          )}
        </div>
      );
    }

    if (message.type === "file" && message.mediaUrl) {
      return (
        <div className="flex items-center gap-3 rounded-xl bg-background/10 p-2 pr-4 backdrop-blur-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/20">
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <a
              href={message.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 truncate text-sm font-medium hover:underline"
            >
              {message.fileName || "Download File"}
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
            {message.fileSize && (
              <p className="text-[10px] opacity-70">
                {(message.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        </div>
      );
    }

    // Default text
    return (
      <p className="whitespace-pre-wrap break-words font-inter text-sm leading-relaxed tracking-wide md:text-base">
        {message.content || ""}
      </p>
    );
  };

  return (
    <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] px-5 py-3 shadow-sm transition-all",
          isMe
            ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-bl-sm bg-muted text-foreground"
        )}
      >
        {renderContent()}
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px] font-medium opacity-60",
            isMe ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {message.createdAt && format(new Date(message.createdAt), "HH:mm")}
          {message.isEdited && <span>(edited)</span>}
        </div>
      </div>
    </div>
  );
};
