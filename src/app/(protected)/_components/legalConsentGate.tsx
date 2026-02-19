"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/AppContext";
import { submitLegalConsents } from "@/models/api/user";
import { buildAcceptedLegalConsents, LEGAL_DOC_LINKS } from "@/constants/legal";

export const LegalConsentGate = () => {
  const { t } = useTranslation();
  const { brokerData, setBrokerData } = useApp();
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = legalAccepted && !submitting;

  const handleContinue = async () => {
    if (!legalAccepted) {
      toast.error(t("legal_accept_required_error"));
      return;
    }

    setSubmitting(true);
    try {
      const legalConsents = buildAcceptedLegalConsents("post_signup_gate");
      const response = await submitLegalConsents({ legalConsents });
      const persisted = response.data?.legalConsents ?? legalConsents;

      if (brokerData) {
        setBrokerData({
          ...brokerData,
          legalConsents: persisted,
        });
      }

      toast.success(t("legal_save_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("legal_save_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-xl border bg-card p-5 md:p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-primary/10 p-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{t("legal_gate_title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("legal_gate_description")}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <a
            href={LEGAL_DOC_LINKS.masterTerms}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Platform Terms
          </a>
          <Separator orientation="vertical" className="h-4" />
          <a
            href={LEGAL_DOC_LINKS.brokerTerms}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Terms of Use for Brokers
          </a>
          <Separator orientation="vertical" className="h-4" />
          <a
            href={LEGAL_DOC_LINKS.privacyPolicy}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Privacy Policy
          </a>
        </div>

        <div className="mt-5">
          <div className="flex items-start gap-2">
            <Checkbox
              checked={legalAccepted}
              onCheckedChange={(checked) => setLegalAccepted(checked === true)}
              className="mt-1"
              id="legal-consent"
            />
            <Label
              htmlFor="legal-consent"
              className="text-sm leading-relaxed cursor-pointer"
            >
              <Trans
                i18nKey="legal_accept_all_label"
                components={{
                  masterTerms: (
                    <a
                      href={LEGAL_DOC_LINKS.masterTerms}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    />
                  ),
                  brokerTerms: (
                    <a
                      href={LEGAL_DOC_LINKS.brokerTerms}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    />
                  ),
                  privacyPolicy: (
                    <a
                      href={LEGAL_DOC_LINKS.privacyPolicy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    />
                  ),
                }}
              />
            </Label>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          className="mt-6 w-full"
          disabled={!canSubmit}
        >
          {submitting ? t("legal_saving") : t("legal_continue")}
        </Button>
      </div>
    </div>
  );
};
