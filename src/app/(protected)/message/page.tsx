"use client";
import React, { useState, useEffect } from "react";
import { useGetConversations, useCreateConversation } from "@/hooks/useChat";
import { useApp } from "@/context/AppContext";
import { ConversationList } from "./_components/ConversationList";
import { ChatWindow } from "./_components/ChatWindow";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Conversation } from "@/models/types/chat";

const MessagePage = () => {
  const { conversations, isLoadingConversations } = useGetConversations();
  const { createConversation, isCreatingConversation } =
    useCreateConversation();
  const { userData, brokerData, companyData } = useApp();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const isMobile = useIsMobile();

  const currentUserId = brokerData?._id || companyData?._id;

  // Auto-select first conversation if available and none selected (only on desktop)
  useEffect(() => {
    if (
      !isMobile &&
      conversations &&
      conversations.length > 0 &&
      !selectedConversationId
    ) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId, isMobile]);

  const handleStartChat = () => {
    if (!currentUserId) return;
    const type = userData?.userType === "company" ? "Company" : "Broker";
    createConversation(
      {
        participantId: currentUserId,
        participantType: type,
      },
      {
        onSuccess: (data) => {
          setSelectedConversationId(data._id);
        },
      }
    );
  };

  const selectedConversation = conversations?.find(
    (c) => c._id === selectedConversationId
  );

  const getPartnerDetails = (conv: Conversation) => {
    // If I am broker/company, partner is adminId
    // If adminId is populated object
    if (conv?.adminId && typeof conv.adminId === "object") {
      return {
        name: conv.adminId.name || "Support",
        initials: (conv.adminId.name || "S").substring(0, 2).toUpperCase(),
      };
    }
    return { name: "Support", initials: "S" };
  };

  const partnerDetails = selectedConversation
    ? getPartnerDetails(selectedConversation)
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-border/40 bg-background transition-all duration-300",
          isMobile
            ? selectedConversationId
              ? "hidden"
              : "w-full"
            : "w-[380px] min-w-[300px]"
        )}
      >
        <div className="flexh-[80px] shrink-0 items-center justify-between p-6 pb-4">
          <h1 className="font-instrument-serif text-3xl font-medium tracking-tight text-foreground">
            Messages
          </h1>
          {!isLoadingConversations &&
            (!conversations || conversations.length === 0) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartChat}
                disabled={isCreatingConversation || !currentUserId}
                className="text-muted-foreground hover:text-accent"
              >
                <MessageSquarePlus className="h-6 w-6" />
              </Button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {isLoadingConversations ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : (
            <ConversationList
              conversations={conversations || []}
              selectedId={selectedConversationId || undefined}
              onSelect={setSelectedConversationId}
            />
          )}
          {!isLoadingConversations &&
            (!conversations || conversations.length === 0) && (
              <div className="mt-20 flex flex-col items-center gap-6 p-8 text-center text-muted-foreground">
                <div className="rounded-full bg-muted/30 p-4">
                  <MessageSquarePlus className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-instrument-serif text-lg text-foreground">
                    No messages yet
                  </h3>
                  <p className="text-sm font-light">
                    Start a conversation with our support team to get help with your inquiries.
                  </p>
                </div>
                <Button
                  onClick={handleStartChat}
                  disabled={isCreatingConversation || !currentUserId}
                  className="h-10 rounded-xl bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {isCreatingConversation
                    ? "Starting..."
                    : "Start Support Chat"}
                </Button>
              </div>
            )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={cn(
          "flex flex-col bg-background transition-all duration-300",
          isMobile ? (selectedConversationId ? "w-full" : "hidden") : "flex-1"
        )}
      >
        {selectedConversationId && currentUserId ? (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 z-10 flex h-[72px] shrink-0 items-center gap-4 border-b border-border/40 bg-background/80 px-6 backdrop-blur-md">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-3"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarFallback className="bg-muted text-sm font-medium">
                  {partnerDetails?.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-instrument-serif text-lg font-medium leading-none text-foreground">
                  {partnerDetails?.name}
                </span>
                <span className="text-xs text-muted-foreground">Active now</span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatWindow
                key={selectedConversationId}
                conversationId={selectedConversationId}
                currentUser={userData}
                currentUserId={currentUserId}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-muted/5 text-muted-foreground">
            {!currentUserId ? (
              <Spinner />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20">
                  <MessageSquarePlus className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
                </div>
                <h3 className="font-instrument-serif text-2xl font-medium text-foreground">
                  Select a conversation
                </h3>
                <p className="text-sm font-light text-muted-foreground">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
