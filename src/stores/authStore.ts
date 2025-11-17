export type BrokerStatus =
  | "approved"
  | "pending"
  | "incomplete"
  | "blacklisted";
export interface Broker {
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
}
