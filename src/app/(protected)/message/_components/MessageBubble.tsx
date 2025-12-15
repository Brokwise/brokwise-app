import { cn } from "@/lib/utils";
import { Message } from "@/models/types/chat";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
  return (
    <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2 text-sm",
          isMe
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={cn(
            "mt-1 text-xs opacity-70 flex items-center justify-end gap-1",
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
