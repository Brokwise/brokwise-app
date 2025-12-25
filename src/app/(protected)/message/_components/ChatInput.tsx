"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Loader2, Smile, X, ImageIcon, FileIcon } from "lucide-react";
import { useState, KeyboardEvent, useRef, ChangeEvent } from "react";
import { uploadFileToFirebase, generateFilePath } from "@/utils/upload";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

interface PendingFile {
  file: File;
  previewUrl: string | null;
  isImage: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [caption, setCaption] = useState("");
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

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Check file size (e.g. 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size is 10MB.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    setPendingFile({ file, previewUrl, isImage });
    setCaption("");
  };

  const handleCancelUpload = () => {
    if (pendingFile?.previewUrl) {
      URL.revokeObjectURL(pendingFile.previewUrl);
    }
    setPendingFile(null);
    setCaption("");
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    try {
      setIsUploading(true);
      const path = generateFilePath(pendingFile.file.name, "chat_uploads");
      const url = await uploadFileToFirebase(pendingFile.file, path);

      const type = pendingFile.isImage ? "image" : "file";

      onSend({
        type,
        mediaUrl: url,
        mediaType: pendingFile.file.type,
        fileName: pendingFile.file.name,
        fileSize: pendingFile.file.size,
        content: caption.trim() || undefined,
      });

      toast.success("File sent successfully");
      handleCancelUpload();
    } catch (error) {
      console.error("File upload failed", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <>
      {/* File Preview Dialog */}
      <Dialog open={!!pendingFile} onOpenChange={(open) => !open && handleCancelUpload()}>
        <DialogContent className="max-w-md rounded-2xl border-border/40 bg-background p-0 shadow-2xl">
          <DialogHeader className="border-b border-border/30 px-6 py-4">
            <DialogTitle className="font-instrument-serif text-xl font-medium">
              {pendingFile?.isImage ? "Send Image" : "Send File"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 py-4">
            {/* Preview */}
            {pendingFile?.isImage && pendingFile.previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border/30 bg-muted/20">
                <img
                  src={pendingFile.previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-[300px] w-auto object-contain"
                />
              </div>
            ) : pendingFile && (
              <div className="flex items-center gap-4 rounded-xl border border-border/30 bg-muted/20 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <FileIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{pendingFile.file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(pendingFile.file.size)}</p>
                </div>
              </div>
            )}

            {/* Caption input for images */}
            {pendingFile?.isImage && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Add a caption (optional)</label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="min-h-[60px] resize-none rounded-xl border-border/30 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border/30 px-6 py-4">
            <Button
              variant="ghost"
              onClick={handleCancelUpload}
              disabled={isUploading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Input Bar */}
      <div className="relative flex items-end gap-3 border-t border-border/40 bg-background/95 p-4 backdrop-blur-md md:pb-4">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
        />

        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            onClick={triggerFileSelect}
            disabled={disabled || isUploading}
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                disabled={disabled || isUploading}
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto border-none p-0 shadow-xl" align="start" side="top">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setMessage((prev) => prev + emojiData.emoji)
                }
                width={300}
                height={350}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-[120px] flex-1 resize-none rounded-2xl border-transparent bg-muted/30 px-4 py-3 placeholder:text-muted-foreground/60 focus:border-border/30 focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary/20 scrollbar-hide"
          disabled={disabled || isUploading}
        />

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};
