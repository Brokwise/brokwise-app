
export type KycStatus =
  | "not_started"
  | "initiating"
  | "pending"
  | "verified"
  | "failed"
  | "expired";

export type KycState = {
  status: KycStatus;
  verificationId?: string;
  userDetails?: DigiLockerUserDetails;
  digiLockerUrl?: string;
  duplicateReason?: string;
};

export type DigiLockerUserDetails = {
  name: string;
  dob: string;
  gender: string;
  eaadhaar: string;
  mobile: string;
};



export type InitiateDigiLockerRequest = {
  platform: "web" | "ios" | "android";
};

export type InitiateDigiLockerResponse = {
  success: boolean;
  data: {
    verificationId: string;
    url: string;
    status: string;
    referenceId: number;
  };
};

export type DigiLockerStatusResponse = {
  success: boolean;
  data: {
    verificationId: string;
    status:
    | "PENDING"
    | "AUTHENTICATED"
    | "EXPIRED"
    | "CONSENT_DENIED"
    | "FAILURE";
    userDetails?: DigiLockerUserDetails;
    documentConsent?: string[];
    documentConsentValidity?: string;
  };
};
