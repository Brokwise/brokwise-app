import i18n from "@/i18n";

export const DISCLAIMER_TEXT = {
  get title() {
    return i18n.t("disclaimer_title");
  },
  get contactSharing() {
    return i18n.t("disclaimer_contact_sharing");
  },
  get enquiryProposal() {
    return i18n.t("disclaimer_enquiry_proposal");
  },
  get documentUpload() {
    return i18n.t("disclaimer_document_upload");
  },
  get resourcesExternal() {
    return i18n.t("disclaimer_resources_external");
  },
  get landConverter() {
    return i18n.t("disclaimer_land_converter");
  },
  get news() {
    return i18n.t("disclaimer_news");
  },
  get profileReverification() {
    return i18n.t("disclaimer_reverification");
  },
  get acknowledgeLabel() {
    return i18n.t("disclaimer_acknowledge_label");
  },
  get mandatoryLabel() {
    return i18n.t("disclaimer_mandatory_error");
  },
} as const;
