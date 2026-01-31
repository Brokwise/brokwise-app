import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/models/types/chat";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 pb-4">
      {conversations.map((conv) => {

        let partnerName = "Support";
        let partnerInitials = "S";

        // Logic: The logged in user is either 'broker' or 'company'
        // So the partner is the Admin.
        if (conv.adminId) {
          partnerName = "Brokwise";
          partnerInitials = partnerName.substring(0, 2).toUpperCase();
        }

        const isSelected = selectedId === conv._id;

        return (
          <div
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={cn(
              "group relative flex cursor-pointer items-center gap-4 rounded-r-xl border-l-[3px] border-transparent p-4 transition-all hover:bg-muted/40",
              isSelected
                ? "bg-primary/5 border-primary"
                : "border-transparent"
            )}
          >
            <Avatar className="h-12 w-12 border border-border/40 transition-transform group-hover:scale-105">
              <AvatarImage src="/logo.webp" />
              <AvatarFallback className={cn("text-sm", isSelected ? "bg-primary/10 text-primary" : "bg-muted")}>
                {partnerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "truncate text-base",
                  isSelected ? "font-semibold text-primary" : "font-medium text-foreground"
                )}>
                  {partnerName}
                </span>
                {conv.lastMessageAt && (
                  <span className="shrink-0 text-[10px] font-medium text-muted-foreground/60">
                    {format(new Date(conv.lastMessageAt), "MMM d")}
                  </span>
                )}
              </div>
              <p className={cn(
                "truncate text-sm transition-colors",
                isSelected ? "text-primary/70" : "text-muted-foreground"
              )}>
                {conv.lastMessage || t("page_messages_no_messages_list")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
