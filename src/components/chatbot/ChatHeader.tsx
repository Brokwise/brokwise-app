"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatHeaderProps {
  onClose: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

export function ChatHeader({ onClose, onClearChat, hasMessages }: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{t("chatbot_title")}</h2>
          <p className="text-xs text-muted-foreground">{t("chatbot_subtitle")}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {hasMessages && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("chatbot_clear_title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("chatbot_clear_description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("action_cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onClearChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t("action_clear")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
