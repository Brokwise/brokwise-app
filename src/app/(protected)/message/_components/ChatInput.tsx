"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Loader2, Smile, FileIcon } from "lucide-react";
import { useState, KeyboardEvent, useRef, ChangeEvent } from "react";
import { uploadFileToFirebase, generateFilePath, convertImageToWebP } from "@/utils/upload";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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

    // If user is replacing an existing pending image, release the old object URL to avoid leaks.
    if (pendingFile?.previewUrl) {
      URL.revokeObjectURL(pendingFile.previewUrl);
    }

    // Check file size (e.g. 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("page_messages_file_too_large"));
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

      let fileToUpload = pendingFile.file;
      if (pendingFile.isImage) {
        fileToUpload = await convertImageToWebP(pendingFile.file);
      }

      const path = generateFilePath(fileToUpload.name, "chat_uploads");
      const url = await uploadFileToFirebase(fileToUpload, path);

      const type = pendingFile.isImage ? "image" : "file";

      onSend({
        type,
        mediaUrl: url,
        mediaType: pendingFile.file.type,
        fileName: pendingFile.file.name,
        fileSize: pendingFile.file.size,
        content: caption.trim() || undefined,
      });

      toast.success(t("page_messages_file_sent"));
      handleCancelUpload();
    } catch (error) {
      console.error("File upload failed", error);
      toast.error(t("page_messages_file_error"));
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
        <DialogContent className="max-w-md rounded-2xl border-border/40 bg-background p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-border/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {pendingFile?.isImage ? t("page_messages_send_image") : t("page_messages_send_file")}
              </DialogTitle>
              {/* Close button is usually handled by Dialog primitive but adding explicit cancel if needed */}
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            {/* Preview */}
            {pendingFile?.isImage && pendingFile.previewUrl ? (
              <div className="group relative overflow-hidden rounded-xl border border-border/20 bg-muted/30 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingFile.previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-[350px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            ) : pendingFile && (
              <div className="flex items-center gap-4 rounded-xl border border-border/20 bg-muted/30 p-4 shadow-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
                  <FileIcon className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-foreground">{pendingFile.file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(pendingFile.file.size)}</p>
                </div>
              </div>
            )}

            {/* Caption input for images */}
            {pendingFile?.isImage && (
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  {t("page_messages_add_caption")}
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("page_messages_write_caption")}
                  className="min-h-[80px] resize-none rounded-xl border-border/30 bg-muted/30 px-4 py-3 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border/10 bg-muted/5 px-6 py-4">
            <Button
              variant="ghost"
              onClick={handleCancelUpload}
              disabled={isUploading}
              className="rounded-xl hover:bg-muted/80"
            >
              {t("action_cancel")}
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="rounded-xl bg-primary px-8 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("page_messages_sending")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("page_messages_send")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Input Bar */}
      <div className="relative flex items-end border-t border-border/40 bg-background/95 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-4 md:pr-44 lg:pr-52">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
        />

        <div className="mx-auto flex w-full max-w-5xl items-end gap-2 sm:gap-3">
          {/* Input Wrapper */}
          <div className="flex w-full flex-1 items-end gap-2 rounded-[26px] border border-border/40 bg-muted/40 p-2 shadow-sm transition-all focus-within:border-primary/20 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10 sm:p-2.5">

            {/* Left Actions */}
            <div className="flex shrink-0 gap-0.5 pb-0.5 pl-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={triggerFileSelect}
                disabled={disabled || isUploading}
                title={t("page_messages_attach_file")}
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    disabled={disabled || isUploading}
                    title={t("page_messages_add_emoji")}
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
                    previewConfig={{ showPreview: false }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("page_messages_type_message")}
              className="min-h-[48px] max-h-[180px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 md:min-h-[64px] md:px-3 md:py-4 md:text-base"
              disabled={disabled || isUploading}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isUploading}
            size="icon"
            className="h-[52px] w-[52px] shrink-0 rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 md:h-[56px] md:w-[56px]"
          >
            <Send className="h-5 w-5 translate-x-0.5 md:h-[22px] md:w-[22px]" />
          </Button>
        </div>
      </div>
    </>
  );
};
