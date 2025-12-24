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
    <div className="flex h-full min-h-0 w-full p-4">
      <Card className="flex min-h-0 w-full flex-1 overflow-hidden border bg-background shadow-sm">
        {/* Sidebar */}
        <div
          className={cn(
            "flex flex-col border-r bg-muted/10 transition-all duration-300",
            isMobile
              ? selectedConversationId
                ? "hidden"
                : "w-full"
              : "w-1/3 min-w-[300px]"
          )}
        >
          <div className="p-4 border-b font-semibold bg-background flex justify-between items-center h-[60px]">
            <span>Messages</span>
            {!isLoadingConversations &&
              (!conversations || conversations.length === 0) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartChat}
                  disabled={isCreatingConversation || !currentUserId}
                >
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
              )}
          </div>
          <div className="flex-1 overflow-y-auto bg-background">
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
                <div className="flex flex-col items-center gap-4 p-8 text-center text-muted-foreground mt-10">
                  <p className="text-sm">
                    No conversations yet. <br /> Start chatting with support.
                  </p>
                  <Button
                    onClick={handleStartChat}
                    disabled={isCreatingConversation || !currentUserId}
                    size="sm"
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
              <div className="px-4 border-b flex items-center gap-3 h-[60px] shrink-0">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-ml-2"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{partnerDetails?.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">
                    {partnerDetails?.name}
                  </div>
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
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              {!currentUserId ? (
                <Spinner />
              ) : (
                <>
                  <MessageSquarePlus className="h-12 w-12 opacity-20 mb-4" />
                  <p>Select a conversation to start chatting</p>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessagePage;
