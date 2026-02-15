export const LEGAL_DOC_LINKS = {
  masterTerms: "/platform-terms",
  brokerTerms: "/broker-terms",
  privacyPolicy: "/privacy-policy",
} as const;

export const LEGAL_DOC_VERSIONS = {
  masterTerms: "master-platform-terms-v1",
  brokerTerms: "broker-terms-v1",
  privacyPolicy: "privacy-policy-2026-02-11",
} as const;

export type LegalConsentSource = "signup" | "post_signup_gate";

export type LegalConsentRecord = {
  accepted: boolean;
  acceptedAt?: string;
  version: string;
};

export type LegalConsentsPayload = {
  masterTerms: LegalConsentRecord;
  brokerTerms: LegalConsentRecord;
  privacyPolicy: LegalConsentRecord;
  source: LegalConsentSource;
  updatedAt?: string;
};

export const buildAcceptedLegalConsents = (
  source: LegalConsentSource
): LegalConsentsPayload => {
  const now = new Date().toISOString();
  return {
    masterTerms: {
      accepted: true,
      acceptedAt: now,
      version: LEGAL_DOC_VERSIONS.masterTerms,
    },
    brokerTerms: {
      accepted: true,
      acceptedAt: now,
      version: LEGAL_DOC_VERSIONS.brokerTerms,
    },
    privacyPolicy: {
      accepted: true,
      acceptedAt: now,
      version: LEGAL_DOC_VERSIONS.privacyPolicy,
    },
    source,
    updatedAt: now,
  };
};

export const hasRequiredLegalConsents = (
  legalConsents?: Partial<LegalConsentsPayload> | null
): boolean => {
  if (!legalConsents) return false;

  return (
    legalConsents.masterTerms?.accepted === true &&
    legalConsents.masterTerms.version === LEGAL_DOC_VERSIONS.masterTerms &&
    legalConsents.brokerTerms?.accepted === true &&
    legalConsents.brokerTerms.version === LEGAL_DOC_VERSIONS.brokerTerms &&
    legalConsents.privacyPolicy?.accepted === true &&
    legalConsents.privacyPolicy.version === LEGAL_DOC_VERSIONS.privacyPolicy
  );
};
