import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/models/types/chat";
import { format } from "date-fns";
import { UserData } from "@/context/AppContext";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  currentUser: UserData | null;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  currentUser,
}: ConversationListProps) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      {conversations.map((conv) => {
        // Determine partner
        // If I am broker/company (currentUser), I see adminId
        // If I am admin (unlikely in this app context, but checking), I see participantId
        let partnerName = "Support";
        let partnerInitials = "S";

        // Logic: The logged in user is either 'broker' or 'company'
        // So the partner is the Admin.
        if (conv.adminId) {
          partnerName = conv.adminId.name || "Support";
          partnerInitials = partnerName.substring(0, 2).toUpperCase();
        }

        return (
          <div
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
              selectedId === conv._id ? "bg-muted" : ""
            )}
          >
            <Avatar>
              <AvatarFallback>{partnerInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="font-medium truncate">{partnerName}</span>
                {conv.lastMessageAt && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(conv.lastMessageAt), "MMM d")}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conv.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
