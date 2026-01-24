// === CONTACT TYPES ===

export type ContactSource = "ENQUIRY_SUBMISSION" | "PROPERTY_INQUIRY";
export type ContactType = "SENT" | "RECEIVED";

// Nested contact info from the API
export interface ContactInfo {
  _id: string;
  email?: string;
  city?: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  mobile?: string;
}

// Connection context for the contact
export interface ConnectionContext {
  enquirerName?: string;
  submitterName?: string;
  propertyTitle?: string;
  enquiryTitle?: string;
  availability?: string;
}

// Contact interface based on actual backend response
export interface Contact {
  _id: string;
  contact: ContactInfo;
  source: ContactSource;

  // Reference IDs
  enquiryId?: string;
  propertyId?: string;
  submissionId?: string;

  // Connection context
  connectionContext?: ConnectionContext;
  contactType?: ContactType
  // Timestamps
  connectedAt?: string;
  createdAt: string;
}

// Paginated response for contacts list
export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  totalPages: number;
}

// Contact statistics
export interface ContactStats {
  total: number;
  bySource: {
    ENQUIRY_SUBMISSION: number;
    PROPERTY_INQUIRY: number;
  };
  thisMonth: number;
  thisWeek: number;
}

// Filters for getting contacts
export interface ContactFilters {
  source?: ContactSource;
  contactType?: ContactType;
  page?: number;
  limit?: number;
}

// Search contacts response
export interface SearchContactsResponse {
  contacts: Contact[];
}
