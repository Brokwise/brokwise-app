import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetAdminMessages, useSendAdminMessage } from "@/hooks/useEnquiry";
import { Loader2, Send, User, ShieldCheck } from "lucide-react";
import { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

export const AdminMessages = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const {
    adminMessages,
    isPending: isPendingAdminMessages,
    error: errorAdminMessages,
  } = useGetAdminMessages(id);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendAdminMessage, isPending: isPendingSendAdminMessage } =
    useSendAdminMessage(id);

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [adminMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendAdminMessage(
      { enquiryId: id, message: message },
      {
        onSuccess: () => setMessage(""),
      }
    );
  };

  if (errorAdminMessages) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6 text-destructive text-sm">
          {t("page_enquiry_detail_error_loading_messages")} {errorAdminMessages.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px] shadow-sm">
      <CardHeader className="border-b bg-muted/5 py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {t("page_enquiry_detail_admin_support")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden bg-muted/5">
        {isPendingAdminMessages ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-4">
              {adminMessages && adminMessages.length > 0 ? (
                adminMessages.map((msg) => {
                  const isMe = msg.senderType === "broker";
                  return (
                    <div
                      key={msg._id}
                      className={cn(
                        "flex w-full gap-2",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8 border bg-background">
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-background border rounded-bl-none"
                        )}
                      >
                        <p>{msg.message}</p>
                        <p
                          className={cn(
                            "text-[10px] mt-1 opacity-70",
                            isMe
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {isMe && (
                        <Avatar className="h-8 w-8 border bg-primary/10">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  {t("page_enquiry_detail_no_messages_admin")}
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="p-3 border-t bg-background">
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder={t("page_enquiry_detail_type_message")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
            disabled={isPendingSendAdminMessage}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPendingSendAdminMessage || !message.trim()}
            className="shrink-0"
          >
            {isPendingSendAdminMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
