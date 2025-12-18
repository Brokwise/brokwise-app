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
        <div className="space-y-1">
          <div className="relative overflow-hidden rounded-md">
            <Image
              src={message.mediaUrl}
              alt="Sent image"
              width={300}
              height={300}
              className="max-w-full max-h-[300px] object-cover rounded-md"
              loading="lazy"
              unoptimized={!message.mediaUrl.includes('firebasestorage')}
            />
          </div>
          {message.content && (
            <p className="whitespace-pre-wrap break-words text-sm mt-1">
              {message.content}
            </p>
          )}
        </div>
      );
    }

    if (message.type === "file" && message.mediaUrl) {
      return (
        <div className="flex items-center gap-3 p-1">
          <div className="bg-background/20 p-2 rounded-full shrink-0">
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <a
              href={message.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline truncate text-sm font-medium"
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
      <p className="whitespace-pre-wrap break-words">{message.content || ""}</p>
    );
  };

  return (
    <div
      className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 text-sm",
          isMe
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {renderContent()}
        <div
          className={cn(
            "mt-1 text-[10px] opacity-70 flex items-center justify-end gap-1",
            isMe ? "text-primary-foreground/70" : ""
          )}
        >
          {message.createdAt && format(new Date(message.createdAt), "HH:mm")}
          {message.isEdited && <span>(edited)</span>}
        </div>
      </div>
    </div>
  );
};
