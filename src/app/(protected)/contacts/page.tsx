"use client";

import React, { useState, useMemo } from "react";
import {
  useGetContacts,
  useGetContactStats,
  useSearchContacts,
  useDeleteContact,
} from "@/hooks/useContacts";
import {
  useGetContactRequests,
  useRespondToContactRequest,
  useGetPendingContactRequestsCount,
} from "@/hooks/useContactRequest";
import { Contact, ContactSource, ContactType } from "@/models/types/contact";
import { PopulatedContactRequest } from "@/types/contact-request";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/helper";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";

// Icons
import {
  Users,
  Search,
  Phone,
  Mail,
  Building2,
  MoreVertical,
  Trash2,
  TrendingUp,
  FileText,
  Home,
  CalendarDays,
  X,
  Loader2,
  UserCircle,
  MapPin,
  Clock,
  Inbox,
  Send,
  Check,
  XCircle,
  Bell,
  Timer,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { DisclaimerAcknowledge } from "@/components/ui/disclaimer-acknowledge";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";

type FilterTab = "all" | "ENQUIRY_SUBMISSION" | "PROPERTY_INQUIRY";

const ContactsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<FilterTab>("all");
  const [contactTypeFilter, setContactTypeFilter] = useState<ContactType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [requestToAccept, setRequestToAccept] = useState<PopulatedContactRequest | null>(null);
  const [showAcceptDisclaimerDialog, setShowAcceptDisclaimerDialog] = useState(false);
  const [isAcceptDisclaimerChecked, setIsAcceptDisclaimerChecked] = useState(false);
  const { t } = useTranslation();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Determine the source filter for API call
  const apiSource: ContactSource | undefined =
    sourceFilter === "all" ? undefined : sourceFilter;

  // Determine the contact type filter for API call
  const apiContactType: ContactType | undefined =
    contactTypeFilter === "all" ? undefined : contactTypeFilter;

  // Fetch contacts
  const {
    contacts,
    pagination,
    isLoading: isContactsLoading,
    error: contactsError,
  } = useGetContacts(
    { source: apiSource, contactType: apiContactType, page: currentPage, limit: 20 },
    { enabled: !debouncedSearch }
  );

  // Fetch stats
  const { stats, isPending: isStatsLoading } = useGetContactStats();

  // Search contacts
  const { searchResults } = useSearchContacts(debouncedSearch, {
    enabled: !!debouncedSearch,
  });

  // Delete mutation
  const { deleteContact, isPending: isDeleting } = useDeleteContact();

  // Pending contact requests (received)
  const {
    requests: pendingRequests,
    isLoading: isPendingRequestsLoading,
  } = useGetContactRequests(
    { type: "received", status: "PENDING" },
    { enabled: true }
  );

  // Pending count for badge
  const { pendingCount } = useGetPendingContactRequestsCount();

  // Respond to contact request mutation
  const { respondToContactRequest, isPending: isResponding } = useRespondToContactRequest();

  const handleAcceptRequest = (requestId: string) => {
    setRespondingTo(requestId);
    respondToContactRequest(
      { requestId, action: "ACCEPT", disclaimerAccepted: true },
      {
        onSettled: () => setRespondingTo(null),
      }
    );
  };

  const handleRejectRequest = (requestId: string) => {
    setRespondingTo(requestId);
    respondToContactRequest(
      { requestId, action: "REJECT" },
      {
        onSettled: () => setRespondingTo(null),
      }
    );
  };

  const openAcceptDisclaimerDialog = (request: PopulatedContactRequest) => {
    setRequestToAccept(request);
    setIsAcceptDisclaimerChecked(false);
    setShowAcceptDisclaimerDialog(true);
  };

  const handleConfirmAcceptWithDisclaimer = () => {
    if (!requestToAccept) return;
    handleAcceptRequest(requestToAccept._id);
    setShowAcceptDisclaimerDialog(false);
    setRequestToAccept(null);
    setIsAcceptDisclaimerChecked(false);
  };

  // Determine which contacts to display
  const displayedContacts = useMemo(() => {
    if (debouncedSearch) {
      return searchResults;
    }
    return contacts;
  }, [debouncedSearch, searchResults, contacts]);

  const handleTabChange = (value: string) => {
    setSourceFilter(value as FilterTab);
    setCurrentPage(1);
  };

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!contactToDelete) return;

    deleteContact(contactToDelete._id, {
      onSuccess: () => {
        toast.success(t("toast_contact_deleted"));
        setDeleteDialogOpen(false);
        setContactToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || t("toast_error_contact_delete"));
      },
    });
  };

  const getSourceBadge = (source: ContactSource) => {
    const config = {
      ENQUIRY_SUBMISSION: {
        label: t("page_contacts_source_enquiry"),
        className:
          "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: FileText,
      },
      PROPERTY_INQUIRY: {
        label: t("page_contacts_source_property"),
        className:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: Home,
      },
    };
    return config[source];
  };
  const getContactTypeBadge = (type: ContactType) => {
    const config = {
      SENT: {
        label: t("page_contacts_type_sent"),
        className:
          "bg-green-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: FileText,
      },
      RECEIVED: {
        label: t("page_contacts_type_received"),
        className:
          "bg-blue-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: Home,
      },
    };
    return config[type];
  };

  const isLoading = isContactsLoading;

  return (
    <PageShell className="max-w-7xl">
      <PageHeader
        title={t("page_contacts_title")}
        description={t("page_contacts_subtitle")}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title={t("page_contacts_total")}
          value={stats?.total ?? 0}
          icon={Users}
          isLoading={isStatsLoading}
        />
        <StatsCard
          title={t("page_contacts_from_enquiries")}
          value={stats?.bySource?.ENQUIRY_SUBMISSION ?? 0}
          icon={FileText}
          isLoading={isStatsLoading}
          className="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title={t("page_contacts_from_properties")}
          value={stats?.bySource?.PROPERTY_INQUIRY ?? 0}
          icon={Home}
          isLoading={isStatsLoading}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          title={t("page_contacts_this_month")}
          value={stats?.thisMonth ?? 0}
          icon={TrendingUp}
          isLoading={isStatsLoading}
          className="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Pending Contact Requests Section */}
      {(isPendingRequestsLoading || (pendingRequests && pendingRequests.length > 0)) && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle>Pending Contact Requests</CardTitle>
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">
                    {pendingCount}
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>
              Brokers are requesting your contact details for your properties. Respond within 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPendingRequestsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <PendingRequestSkeleton key={i} />
                ))}
              </div>
            ) : pendingRequests && pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <PendingRequestCard
                  key={request._id}
                  request={request}
                  onAccept={openAcceptDisclaimerDialog}
                  onReject={handleRejectRequest}
                  isResponding={isResponding && respondingTo === request._id}
                />
              ))
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          <Tabs
            value={sourceFilter}
            onValueChange={handleTabChange}
            className="w-full sm:w-auto h-full"
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex h-full">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                {t("page_contacts_tab_all")}
              </TabsTrigger>
              <TabsTrigger
                value="ENQUIRY_SUBMISSION"
                className="text-xs sm:text-sm"
              >
                {t("page_contacts_tab_enquiries")}
              </TabsTrigger>
              <TabsTrigger
                value="PROPERTY_INQUIRY"
                className="text-xs sm:text-sm"
              >
                {t("page_contacts_tab_properties")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={contactTypeFilter}
            onValueChange={(value) => {
              setContactTypeFilter(value as ContactType | "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("page_contacts_filter_type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("label_all_types")}</SelectItem>
              <SelectItem value="SENT">{t("page_contacts_type_sent")}</SelectItem>
              <SelectItem value="RECEIVED">{t("page_contacts_type_received")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("page_contacts_search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <ContactCardSkeleton key={i} />
            ))}
          </div>
        ) : contactsError ? (
          <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center">
            <p className="text-red-500 font-medium">
              {t("page_contacts_error")}
            </p>
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              {t("page_contacts_try_again")}
            </Button>
          </div>
        ) : displayedContacts.length === 0 ? (
          <Empty className="h-[400px] border bg-muted/40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchQuery ? t("page_contacts_no_contacts_search") : t("page_contacts_no_contacts_yet")}
              </EmptyTitle>
              <EmptyDescription>
                {searchQuery
                  ? `${t("empty_no_contacts_search", { query: searchQuery })}`
                  : t("page_contacts_empty_desc")}
              </EmptyDescription>
            </EmptyHeader>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                {t("page_contacts_clear_search")}
              </Button>
            )}
          </Empty>
        ) : (
          <div className="grid gap-4">
            {displayedContacts.map((contact) => (
              <ContactCard
                key={contact._id}
                contact={contact}
                onDelete={handleDeleteClick}
                getSourceBadge={getSourceBadge}
                getContactTypeBadge={getContactTypeBadge}
              />
            ))}
          </div>
        )}
      </div>

      {!debouncedSearch && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {t("page_contacts_previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages}
            >
              {t("page_contacts_next")}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("page_contacts_delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm_delete_contact_desc", {
                name: contactToDelete?.contact
                  ? `${contactToDelete.contact.firstName} ${contactToDelete.contact.lastName}`
                  : t("page_contacts_delete_title").toLowerCase()
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("action_cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("page_contacts_deleting")}
                </>
              ) : (
                t("action_delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showAcceptDisclaimerDialog}
        onOpenChange={(isOpen) => {
          setShowAcceptDisclaimerDialog(isOpen);
          if (!isOpen) {
            setRequestToAccept(null);
            setIsAcceptDisclaimerChecked(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Contact Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Accepting this request shares your contact details with the requester.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DisclaimerAcknowledge
            text={DISCLAIMER_TEXT.contactSharing}
            checked={isAcceptDisclaimerChecked}
            onCheckedChange={setIsAcceptDisclaimerChecked}
            checkboxLabel={DISCLAIMER_TEXT.acknowledgeLabel}
            showRequiredMessage
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResponding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAcceptWithDisclaimer}
              disabled={!isAcceptDisclaimerChecked || isResponding}
            >
              {isResponding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  isLoading?: boolean;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
  className,
}: StatsCardProps) => (
  <Card className="border-border/50">
    <CardContent className="p-4 sm:p-6">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Typography variant="muted" className="font-medium">
              {title}
            </Typography>
            <Typography variant="value">
              {value}
            </Typography>
          </div>
          <div
            className={cn(
              "hidden sm:flex h-12 w-12 items-center justify-center rounded-lg bg-muted",
              className
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

// Contact Card Component
interface ContactCardProps {
  contact: Contact;
  onDelete: (contact: Contact) => void;
  getSourceBadge: (source: ContactSource) => {
    label: string;
    className: string;
    icon: React.ElementType;
  };
  getContactTypeBadge: (type: ContactType) => {
    label: string;
    className: string;
    icon: React.ElementType;
  };
}

const ContactCard = ({
  contact,
  onDelete,
  getSourceBadge,
  getContactTypeBadge
}: ContactCardProps) => {
  const { t } = useTranslation();
  const sourceBadge = getSourceBadge(contact.source);
  const typeBadge = contact.contactType && getContactTypeBadge(contact.contactType)
  const SourceIcon = sourceBadge.icon;

  // Extract contact info from nested object
  const contactInfo = contact.contact;
  const fullName = `${contactInfo.firstName} ${contactInfo.lastName}`.trim();
  const context = contact.connectionContext;

  return (
    <Card className="group border border-border/50 bg-card transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardHeader className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Avatar and Info */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* Avatar */}
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>

            {/* Contact Details */}
            <div className="min-w-0 flex-1 space-y-2">
              {/* Name and Source Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <Typography variant="h4" className="leading-tight truncate">
                  {fullName}
                </Typography>
                <Badge
                  variant="outline"
                  className={cn(
                    "border px-2 py-0.5 text-xs font-medium shrink-0",
                    sourceBadge.className
                  )}
                >
                  <SourceIcon className="mr-1 h-3 w-3" />
                  {sourceBadge.label}
                </Badge>
                {contact.contactType && <Badge
                  variant="outline"
                  className={cn(
                    "border px-2 py-0.5 text-xs font-medium shrink-0",
                    typeBadge?.className
                  )}
                >
                  {contact.contactType === "RECEIVED" ? <Inbox className="mr-1 h-3 w-3" /> : <Send className="mr-1 h-3 w-3"></Send>}
                  {contact.contactType == "SENT" ? t("page_contacts_type_shared") : t("page_contacts_type_received")}
                </Badge>}
              </div>

              {/* Contact Info Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {contactInfo.mobile && (
                  <a
                    href={`tel:${contactInfo.mobile}`}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{contactInfo.mobile}</span>
                  </a>
                )}
                {contactInfo.email && (
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors truncate max-w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{contactInfo.email}</span>
                  </a>
                )}
                {contactInfo.companyName && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-[150px]">
                      {contactInfo.companyName}
                    </span>
                  </div>
                )}
                {contactInfo.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-[100px]">
                      {contactInfo.city}
                    </span>
                  </div>
                )}
              </div>

              {/* Connection Context */}
              {context && (
                <div className="mt-2 p-2.5 rounded-lg bg-muted/50 border border-border/50 space-y-1.5">
                  {context.enquiryTitle && (
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{t("page_contacts_label_enquiry")}</span>
                      <span className="font-medium truncate">
                        {context.enquiryTitle}
                      </span>
                    </div>
                  )}
                  {context.propertyTitle && (
                    <div className="flex items-center gap-2 text-xs">
                      <Home className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{t("page_contacts_label_property")}</span>
                      <span className="font-medium truncate">
                        {context.propertyTitle}
                      </span>
                    </div>
                  )}
                  {context.availability && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{t("page_contacts_label_available")}</span>
                      <span className="font-medium">
                        {context.availability}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <CalendarDays className="h-3 w-3" />
                <span>
                  {t("page_contacts_connected")}{" "}
                  {formatDistanceToNow(
                    new Date(contact.connectedAt || contact.createdAt),
                    {
                      addSuffix: true,
                    }
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(contact)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("page_contacts_delete_contact")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
};

// Skeleton for loading state
const ContactCardSkeleton = () => (
  <Card className="border border-border/50">
    <CardHeader className="p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="hidden sm:block h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </CardHeader>
  </Card>
);

// Pending Request Card Component
interface PendingRequestCardProps {
  request: PopulatedContactRequest;
  onAccept: (request: PopulatedContactRequest) => void;
  onReject: (requestId: string) => void;
  isResponding: boolean;
}

const PendingRequestCard = ({
  request,
  onAccept,
  onReject,
  isResponding,
}: PendingRequestCardProps) => {
  const property = request.propertyId;
  const expiresAt = new Date(request.expiresAt);
  const timeLeft = formatDistanceToNow(expiresAt, { addSuffix: false });
  const isExpiringSoon = expiresAt.getTime() - Date.now() < 12 * 60 * 60 * 1000; // Less than 12 hours

  const requesterLabel = request.requesterLabel || "A broker";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-background border border-border/50 shadow-sm">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={undefined} alt={requesterLabel} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            <UserCircle className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <Typography variant="small" as="span" className="font-semibold truncate">
            {requesterLabel}
          </Typography>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span className="truncate max-w-[200px]">
                {property.propertyId || `${property.propertyCategory} - ${property.propertyType?.replace(/_/g, " ")}`}
              </span>
            </div>
            {property.totalPrice && (
              <span className="font-medium text-foreground">
                {formatCurrency(property.totalPrice)}
              </span>
            )}
          </div>

          <div className={cn(
            "flex items-center gap-1 text-xs",
            isExpiringSoon ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          )}>
            <Timer className="h-3 w-3" />
            <span>Expires in {timeLeft}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(request._id)}
          disabled={isResponding}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isResponding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </>
          )}
        </Button>
        <Button
          size="sm"
          onClick={() => onAccept(request)}
          disabled={isResponding}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isResponding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Accept
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Skeleton for pending request card
const PendingRequestSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-background border border-border/50">
    <div className="flex items-start gap-3 flex-1">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="flex gap-2 shrink-0">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export default ContactsPage;
