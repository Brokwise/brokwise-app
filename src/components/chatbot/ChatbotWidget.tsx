"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useChatbot } from "@/hooks/useChatbot";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useIsMobile } from "@/hooks/use-mobile";

export function ChatbotWidget() {
  const isMobile = useIsMobile();
  const { messages, isOpen, setIsOpen, clearChat } = useChatbotStore();
  const { sendMessage, isStreaming } = useChatbot();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClearChat = () => {
    clearChat();
  };

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  // Render chat content
  const ChatContent = () => (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader
        onClose={handleClose}
        onClearChat={handleClearChat}
        hasMessages={messages.length > 0}
      />
      <ChatMessages
        messages={messages}
        isStreaming={isStreaming}
        onSuggestionClick={handleSendMessage}
      />
      <ChatInput onSend={handleSendMessage} isStreaming={isStreaming} />
    </div>
  );

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "fixed z-50",
              // Position: bottom-right, above bottom nav on mobile
              isMobile ? "bottom-28 right-4" : "bottom-6 right-6"
            )}
          >
            <Button
              onClick={handleToggle}
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg",
                "bg-primary hover:bg-primary/90",
                "transition-transform hover:scale-105 active:scale-95"
              )}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            {/* Notification dot if there are messages */}
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive border-2 border-background" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Full-screen Sheet */}
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="bottom"
            className="h-[85vh] p-0 rounded-t-3xl overflow-hidden"
            hideCloseButton
          >
            <ChatContent />
          </SheetContent>
        </Sheet>
      ) : (
        /* Desktop: Floating Panel with Backdrop */
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop overlay - click to close */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/20"
                onClick={handleClose}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "fixed z-50 bottom-6 right-6",
                  // Responsive width: 36vw (~20% wider) with min/max bounds for readability
                  "w-[40vw] min-w-[450px] max-w-[560px]",
                  // Viewport-based height for full chat experience
                  "h-[90vh] max-h-[90vh]",
                  "rounded-2xl shadow-2xl border overflow-hidden",
                  "bg-background"
                )}
              >
                <ChatContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
