"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useNotification,
  useUpdateNotification,
  Notification,
} from "@/hooks/useNotifications";
import {
  useCompanyInvitations,
  useAcceptCompanyInvitation,
  useRejectCompanyInvitation,
} from "@/hooks/useCompanyInvitations";
import { CompanyInvitation } from "@/models/types/invitation";
import { Bell, Check, Clock, X, Building2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Notifications = () => {
  const { notificationsData, isLoading: isLoadingNotifications } =
    useNotification();
  const { mutate, isPending } = useUpdateNotification();
  const { invitations, isLoading: isLoadingInvitations } =
    useCompanyInvitations("pending");
  const { acceptInvitation, isPending: isAccepting } =
    useAcceptCompanyInvitation();
  const { rejectInvitation, isPending: isRejecting } =
    useRejectCompanyInvitation();

  const queryClient = useQueryClient();

  const { unreadNotifications, readNotifications, unreadCount } =
    useMemo(() => {
      if (!notificationsData) {
        return {
          unreadNotifications: [],
          readNotifications: [],
          unreadCount: 0,
        };
      }

      const unread = notificationsData.filter((n) => !n.read);
      const read = notificationsData.filter((n) => n.read);

      return {
        unreadNotifications: unread,
        readNotifications: read,
        unreadCount: unread.length,
      };
    }, [notificationsData]);

  const totalUnreadCount = unreadCount + (invitations?.length || 0);
  const isLoading = isLoadingNotifications || isLoadingInvitations;
  const hasContent =
    (notificationsData && notificationsData.length > 0) ||
    (invitations && invitations.length > 0);

  const handleMarkAsRead = (notification: Notification) => {
    mutate(
      { read: true, _id: notification._id },
      {
        onSuccess: () => {
          toast.success("Notification marked as read");
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
          toast.error("Failed to mark notification as read");
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const InvitationItem = ({
    invitation,
  }: {
    invitation: CompanyInvitation;
  }) => (
    <Card className="mb-3 border-blue-200 bg-blue-50/50 dark:bg-primary/10 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 dark:bg-blue-500" />
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Company Invitation
                </h4>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {invitation.company?.name}
              </span>{" "}
              has invited you to join their company.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDate(invitation.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <Button
            onClick={() => rejectInvitation(invitation._id)}
            variant="outline"
            size="sm"
            disabled={isAccepting || isRejecting}
            className="h-7 px-3 text-xs"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Decline
          </Button>
          <Button
            onClick={() => acceptInvitation(invitation._id)}
            size="sm"
            disabled={isAccepting || isRejecting}
            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const NotificationItem = ({
    notification,
    isUnread,
  }: {
    notification: Notification;
    isUnread: boolean;
  }) => (
    <Card
      className={`mb-3 transition-all duration-200 ${
        isUnread
          ? "border-primary/20 dark:border-primary/20 bg-blue-50/50 dark:bg-primary/5"
          : "border-primary/20 dark:border-primary/20"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {isUnread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 dark:bg-blue-500" />
              )}
              <h4
                className={`text-sm font-medium ${
                  isUnread
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-700 dark:text-gray-100"
                }`}
              >
                {notification.title}
              </h4>
            </div>
            {notification.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {notification.description}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDate(notification.createdAt)}
            </div>
          </div>
          {isUnread && (
            <Button
              onClick={() => handleMarkAsRead(notification)}
              variant="ghost"
              size="sm"
              disabled={isPending}
              className="flex-shrink-0 h-8 px-3 text-xs hover:bg-primary/10"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {totalUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {totalUnreadCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalUnreadCount} new
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !hasContent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mb-4 dark:text-gray-100" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-sm text-gray-500">
                You&apos;re all caught up! Check back later for new updates.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Invitations Section */}
              {invitations && invitations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Invitations
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {invitations.length}
                    </Badge>
                  </div>
                  {invitations.map((invitation) => (
                    <InvitationItem
                      key={invitation._id}
                      invitation={invitation}
                    />
                  ))}
                  <Separator className="my-6" />
                </div>
              )}

              {/* Unread Notifications Section */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Unread
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {unreadNotifications.length}
                    </Badge>
                  </div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      isUnread={true}
                    />
                  ))}
                </div>
              )}

              {/* Separator between sections */}
              {unreadNotifications.length > 0 &&
                readNotifications.length > 0 && <Separator className="my-6" />}

              {/* Read Notifications Section */}
              {readNotifications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Read
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {readNotifications.length}
                    </Badge>
                  </div>
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      isUnread={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
