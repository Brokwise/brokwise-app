"use client";
import React, { useState, useEffect } from "react";
import { useGetConversations, useCreateConversation } from "@/hooks/useChat";
import { useApp } from "@/context/AppContext";
import { ConversationList } from "./_components/ConversationList";
import { ChatWindow } from "./_components/ChatWindow";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "@/models/types/chat";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

const MessagePage = () => {
  const { conversations, isLoadingConversations } = useGetConversations();
  const { createConversation, isCreatingConversation } =
    useCreateConversation();
  const { userData, brokerData, companyData } = useApp();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const currentUserId = brokerData?._id || companyData?._id;

  const router = useRouter()
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
        name: "Brokwise",
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
        <div className="flex h-[80px] shrink-0 items-center justify-between border-b border-border/20 px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <Button onClick={() => { router.push("/") }} variant={"ghost"}><ArrowLeft />Back</Button>
            {t("page_messages_title")}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStartChat}
            disabled={isCreatingConversation || !currentUserId || isLoadingConversations}
            className="h-10 w-10 rounded-full text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
            title={t("page_messages_start_chat")}
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
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
                  <h3 className="text-lg text-foreground">
                    {t("page_messages_no_messages")}
                  </h3>
                  <p className="text-sm font-light">
                    {t("page_messages_no_messages_desc")}
                  </p>
                </div>
                <Button
                  onClick={handleStartChat}
                  disabled={isCreatingConversation || !currentUserId}
                  className="h-10 rounded-xl bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {isCreatingConversation
                    ? t("page_messages_starting")
                    : t("page_messages_start_support")}
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
                <AvatarImage src={"/logo.webp"} />
                <AvatarFallback className="bg-muted text-sm font-medium">
                  {partnerDetails?.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-medium leading-none text-foreground">
                  {partnerDetails?.name}
                </span>
                <span className="text-xs text-muted-foreground">{t("page_messages_active_now")}</span>
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
                <h3 className="text-2xl font-medium text-foreground">
                  {t("page_messages_select_conversation")}
                </h3>
                <p className="text-sm font-light text-muted-foreground">
                  {t("page_messages_select_conversation_desc")}
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
