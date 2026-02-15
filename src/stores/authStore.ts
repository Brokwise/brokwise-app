export type BrokerStatus =
  | "approved"
  | "pending"
  | "incomplete"
  | "rejected"
  | "blacklisted";
export interface Broker {
  legalConsents?: {
    masterTerms: { accepted: boolean; version: string; acceptedAt?: string };
    brokerTerms: { accepted: boolean; version: string; acceptedAt?: string };
    privacyPolicy: { accepted: boolean; version: string; acceptedAt?: string };
    source?: "signup" | "post_signup_gate";
    updatedAt?: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  uid: string;
  mobile: string;
  companyName: string;
  gstin: string;
  yearsOfExperience: number;
  city: string;
  officeAddress: string;
  reraNumber: string;
  status: BrokerStatus;
  companyId?: string;
  createdAt: string;
  brokerId: string;
  userType?: "broker" | "company";
  invitationStatus?: string;
}
