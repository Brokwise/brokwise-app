import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Loader2, Smile } from "lucide-react";
import { useState, KeyboardEvent, useRef, ChangeEvent } from "react";
import { uploadFileToFirebase, generateFilePath } from "@/utils/upload";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInputProps {
  onSend: (data: {
    content?: string;
    type?: "text" | "image" | "file";
    mediaUrl?: string;
    mediaType?: string;
    fileName?: string;
    fileSize?: number;
  }) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend({ content: message, type: "text" });
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear input so same file can be selected again
    const currentInput = fileInputRef.current;

    // Check file size (e.g. 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size is 10MB.");
      if (currentInput) currentInput.value = "";
      return;
    }

    try {
      setIsUploading(true);
      const path = generateFilePath(file.name, "chat_uploads");
      const url = await uploadFileToFirebase(file, path);

      const type = file.type.startsWith("image/") ? "image" : "file";

      onSend({
        type,
        mediaUrl: url,
        mediaType: file.type,
        fileName: file.name,
        fileSize: file.size,
        content: undefined, // Or empty string?
      });

      toast.success("File sent successfully");
    } catch (error) {
      console.error("File upload failed", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (currentInput) currentInput.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex items-end gap-3 border-t border-border/40 bg-background/80 p-4 pb-6 backdrop-blur-md">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      // accept="image/*,.pdf,.doc,.docx" // Optional: restrict file types
      />

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground rounded-full"
          onClick={triggerFileSelect}
          disabled={disabled || isUploading}
          title="Attach file"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground rounded-full"
              disabled={disabled || isUploading}
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-none p-0 shadow-xl" align="start">
            <EmojiPicker
              onEmojiClick={(emojiData) =>
                setMessage((prev) => prev + emojiData.emoji)
              }
              width={300}
              height={400}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[44px] max-h-[150px] resize-none rounded-2xl border-transparent bg-muted/30 px-4 py-3 placeholder:text-muted-foreground/60 focus:border-border/30 focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary/20 scrollbar-hide"
        disabled={disabled || isUploading}
      />

      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled || isUploading}
        size="icon"
        className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};
