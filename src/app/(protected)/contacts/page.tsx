"use client";

import React, { useState, useMemo } from "react";
import {
  useGetContacts,
  useGetContactStats,
  useSearchContacts,
  useDeleteContact,
} from "@/hooks/useContacts";
import { Contact, ContactSource } from "@/models/types/contact";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

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
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "ENQUIRY_SUBMISSION" | "PROPERTY_INQUIRY";

const ContactsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Determine the source filter for API call
  const apiSource: ContactSource | undefined =
    sourceFilter === "all" ? undefined : sourceFilter;

  // Fetch contacts
  const {
    contacts,
    pagination,
    isLoading: isContactsLoading,
    error: contactsError,
  } = useGetContacts(
    { source: apiSource, page: currentPage, limit: 20 },
    { enabled: !debouncedSearch }
  );

  // Fetch stats
  const { stats, isPending: isStatsLoading } = useGetContactStats();

  // Search contacts
  const { searchResults, isPending: isSearching } = useSearchContacts(
    debouncedSearch,
    { enabled: !!debouncedSearch }
  );

  // Delete mutation
  const { deleteContact, isPending: isDeleting } = useDeleteContact();

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
        toast.success("Contact deleted successfully");
        setDeleteDialogOpen(false);
        setContactToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete contact");
      },
    });
  };

  const getSourceBadge = (source: ContactSource) => {
    const config = {
      ENQUIRY_SUBMISSION: {
        label: "Enquiry",
        className:
          "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: FileText,
      },
      PROPERTY_INQUIRY: {
        label: "Property",
        className:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: Home,
      },
    };
    return config[source];
  };

  const isLoading = isContactsLoading;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Contacts
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Manage and organize all your contacts from enquiry submissions and
            property inquiries.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Contacts"
          value={stats?.total ?? 0}
          icon={Users}
          isLoading={isStatsLoading}
        />
        <StatsCard
          title="From Enquiries"
          value={stats?.bySource?.ENQUIRY_SUBMISSION ?? 0}
          icon={FileText}
          isLoading={isStatsLoading}
          className="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="From Properties"
          value={stats?.bySource?.PROPERTY_INQUIRY ?? 0}
          icon={Home}
          isLoading={isStatsLoading}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          title="This Month"
          value={stats?.thisMonth ?? 0}
          icon={TrendingUp}
          isLoading={isStatsLoading}
          className="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          value={sourceFilter}
          onValueChange={handleTabChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger
              value="ENQUIRY_SUBMISSION"
              className="text-xs sm:text-sm"
            >
              Enquiries
            </TabsTrigger>
            <TabsTrigger
              value="PROPERTY_INQUIRY"
              className="text-xs sm:text-sm"
            >
              Properties
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or company..."
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
              Unable to load contacts at the moment.
            </p>
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        ) : displayedContacts.length === 0 ? (
          <Empty className="h-[400px] border bg-muted/40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchQuery ? "No contacts found" : "No contacts yet"}
              </EmptyTitle>
              <EmptyDescription>
                {searchQuery
                  ? `No contacts match "${searchQuery}". Try a different search term.`
                  : "Contacts will appear here when you receive enquiries or property inquiries."}
              </EmptyDescription>
            </EmptyHeader>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!debouncedSearch && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
            {pagination.total} contacts
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {contactToDelete?.contact
                  ? `${contactToDelete.contact.firstName} ${contactToDelete.contact.lastName}`
                  : "this contact"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">
              {value}
            </p>
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
}

const ContactCard = ({
  contact,
  onDelete,
  getSourceBadge,
}: ContactCardProps) => {
  const sourceBadge = getSourceBadge(contact.source);
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
                <h3 className="font-semibold text-base sm:text-lg leading-tight tracking-tight truncate">
                  {fullName}
                </h3>
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
                      <span className="text-muted-foreground">Enquiry:</span>
                      <span className="font-medium truncate">
                        {context.enquiryTitle}
                      </span>
                    </div>
                  )}
                  {context.propertyTitle && (
                    <div className="flex items-center gap-2 text-xs">
                      <Home className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Property:</span>
                      <span className="font-medium truncate">
                        {context.propertyTitle}
                      </span>
                    </div>
                  )}
                  {context.availability && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Available:</span>
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
                  Connected{" "}
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
                Delete Contact
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

export default ContactsPage;
