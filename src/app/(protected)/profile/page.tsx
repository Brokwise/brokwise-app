"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { OnboardingDetails } from "@/app/(protected)/_components/onboarding/onboardingDetails";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Building2,
  Briefcase,
  MapPin,
  FileText,
  Award,
  Users,
  Mail,
  Lock,
  Key,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import {
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAxios from "@/hooks/useAxios";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t } = useTranslation();

  const leaveReasonOptions = [
    { value: "Found a better opportunity", label: t("page_profile_leave_reason_better") },
    {
      value: "Company is no longer active",
      label: t("page_profile_leave_reason_inactive"),
    },
    {
      value: "Switching to another company",
      label: t("page_profile_leave_reason_switching"),
    },
    { value: "OTHER", label: t("page_profile_leave_reason_other") },
  ];
  const {
    brokerData,
    brokerDataLoading,
    setBrokerData,
    setCompanyData,
    companyData,
    companyDataLoading,
  } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const api = useAxios();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeavingCompany, setIsLeavingCompany] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [customLeaveReason, setCustomLeaveReason] = useState("");

  const brokerCompanyDetails =
    brokerData &&
      brokerData.companyId &&
      typeof brokerData.companyId === "object"
      ? brokerData.companyId
      : null;

  const hasPassword = user?.providerData.some(
    (p) => p.providerId === "password"
  );

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      await sendPasswordResetEmail(firebaseAuth, user.email);
      toast.success(t("page_profile_password_reset_sent") + " " + user.email);
    } catch (error) {
      console.error(error);
      toast.error(
        (error as { message: string }).message || t("page_profile_password_reset_error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassword = async () => {
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast.error(t("page_profile_passwords_mismatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("page_profile_password_too_short"));
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email, newPassword);
      await linkWithCredential(user, credential);
      toast.success(t("page_profile_password_set_success"));
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if ((error as { code: string }).code === "auth/requires-recent-login") {
        toast.error(t("page_profile_relogin_required"));
      } else {
        toast.error(
          (error as { message: string }).message || t("page_profile_password_set_error")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const trimmedCustomLeaveReason = customLeaveReason.trim();
  const trimmedLeaveReason = leaveReason.trim();
  const isOtherLeaveReason = leaveReason === "OTHER";
  const finalLeaveReason = isOtherLeaveReason
    ? trimmedCustomLeaveReason
    : trimmedLeaveReason;
  const isLeaveReasonValid =
    finalLeaveReason.length > 0 && finalLeaveReason.length <= 500;

  const handleLeaveCompany = async () => {
    if (!isLeaveReasonValid) {
      toast.error(t("page_profile_leave_reason_invalid"));
      return;
    }
    try {
      setIsLeavingCompany(true);
      const response = await api.post("/broker/leave-company", {
        reason: finalLeaveReason,
      });
      const result = response?.data?.data as {
        message?: string;
        broker?: typeof brokerData;
      };
      if (result?.broker) {
        setBrokerData(result.broker);
      } else if (brokerData) {
        setBrokerData({
          ...brokerData,
          companyId: undefined,
          companyName: "",
          gstin: "",
        });
      }
      setCompanyData(null);
      toast.success(result?.message || "You have left the company.");
      setIsLeaveDialogOpen(false);
      setLeaveReason("");
      setCustomLeaveReason("");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as { message?: string }).message ||
        t("page_profile_leave_error");
      toast.error(message);
    } finally {
      setIsLeavingCompany(false);
    }
  };

  if (brokerDataLoading || companyDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">{t("page_profile_loading")}</div>
    );
  }

  if (!brokerData && !companyData) {
    return (
      <div className="flex items-center justify-center h-full">
        {t("page_profile_not_found")}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <OnboardingDetails
          isEditing={true}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  if (companyData) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("page_profile_company_title")}</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {companyData.name?.[0]}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{companyData.name}</CardTitle>
              <p className="text-muted-foreground">{companyData.email}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    companyData.status === "approved" ? "default" : "secondary"
                  }
                >
                  {companyData.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {t("page_profile_label_email")}
                </h3>
                <p className="text-lg font-medium">{companyData.email}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {t("page_profile_label_mobile")}
                </h3>
                <p className="text-lg font-medium">{companyData.mobile}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {t("page_profile_label_location")}
                </h3>
                <div className="space-y-0.5">
                  <p className="text-lg font-medium">{companyData.city}</p>
                  {companyData.officeAddress && (
                    <p className="text-sm text-muted-foreground">
                      {companyData.officeAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> {t("page_profile_label_gstin")}
                </h3>
                <p className="text-lg font-medium">
                  {companyData.gstin || t("page_profile_na")}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> {t("page_profile_label_employees")}
                </h3>
                <p className="text-lg font-medium">
                  {companyData.noOfEmployees || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brokerProfile = brokerData;
  if (!brokerProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        {t("page_profile_not_found")}
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("page_profile_title")}</h1>
        <Button onClick={() => setIsEditing(true)}>{t("page_profile_edit")}</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {brokerProfile.firstName[0]}
            {brokerProfile.lastName[0]}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {brokerProfile.firstName} {brokerProfile.lastName}
            </CardTitle>
            <p className="text-muted-foreground">{brokerProfile.email}</p>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  brokerProfile.status === "approved" ? "default" : "secondary"
                }
              >
                {brokerProfile.status.toUpperCase()}
              </Badge>
              {brokerProfile.brokerId && (
                <Badge variant="outline">ID: {brokerProfile.brokerId}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> {t("page_profile_label_contact")}
              </h3>
              <p className="text-lg font-medium">{brokerProfile.mobile}</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> {t("page_profile_label_experience")}
              </h3>
              <p className="text-lg font-medium">
                {brokerProfile.yearsOfExperience === 15
                  ? "15+"
                  : brokerProfile.yearsOfExperience}{" "}
                {t("page_profile_years")}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t("page_profile_label_location")}
              </h3>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{brokerProfile.city}</p>
                {brokerProfile.officeAddress && (
                  <p className="text-sm text-muted-foreground">
                    {brokerProfile.officeAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4" /> {t("page_profile_label_rera")}
              </h3>
              <p className="text-lg font-medium">
                {brokerProfile.reraNumber || t("page_profile_na")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">{t("page_profile_security_title")}</CardTitle>
            <CardDescription>
              {t("page_profile_security_desc")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Key className="h-4 w-4" /> {t("page_profile_label_password")}
              </h3>
              <p className="text-sm">
                {hasPassword
                  ? t("page_profile_has_password")
                  : t("page_profile_no_password")}
              </p>
            </div>
            {hasPassword ? (
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {t("page_profile_reset_password")}
              </Button>
            ) : (
              <Dialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">{t("page_profile_set_password")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("page_profile_set_password")}</DialogTitle>
                    <DialogDescription>
                      {t("page_profile_set_password_desc")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">{t("page_profile_new_password")}</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("page_profile_new_password_placeholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t("page_profile_confirm_password")}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("page_profile_confirm_password_placeholder")}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(false)}
                      disabled={loading}
                    >
                      {t("action_cancel")}
                    </Button>
                    <Button onClick={handleAddPassword} disabled={loading}>
                      {loading ? t("page_profile_setting_password") : t("page_profile_set_password")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {brokerCompanyDetails ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {brokerCompanyDetails.name}
                  </CardTitle>
                  <CardDescription>{t("page_profile_company_details")}</CardDescription>
                </div>
              </div>
              <Dialog
                open={isLeaveDialogOpen}
                onOpenChange={setIsLeaveDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={isLeavingCompany}>
                    {t("page_profile_leave_company")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("page_profile_leave_title")}</DialogTitle>
                    <DialogDescription>
                      {t("page_profile_leave_desc")}{" "}
                      {brokerCompanyDetails.name}. {t("page_profile_leave_desc_suffix")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="leave-reason">{t("page_profile_leave_reason")}</Label>
                      <Select
                        value={leaveReason}
                        onValueChange={setLeaveReason}
                      >
                        <SelectTrigger id="leave-reason">
                          <SelectValue placeholder={t("page_profile_leave_select_reason")} />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveReasonOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isOtherLeaveReason && (
                      <div className="space-y-2">
                        <Label htmlFor="leave-reason-custom">
                          {t("page_profile_leave_custom_message")}
                        </Label>
                        <Textarea
                          id="leave-reason-custom"
                          value={customLeaveReason}
                          onChange={(event) =>
                            setCustomLeaveReason(event.target.value)
                          }
                          placeholder={t("page_profile_leave_custom_placeholder")}
                          className="min-h-[96px]"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          {trimmedCustomLeaveReason.length}/500 {t("page_profile_leave_chars")}
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsLeaveDialogOpen(false)}
                      disabled={isLeavingCompany}
                    >
                      {t("action_cancel")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLeaveCompany}
                      disabled={!isLeaveReasonValid || isLeavingCompany}
                    >
                      {isLeavingCompany ? t("page_profile_leaving") : t("page_profile_leave_company")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {t("page_profile_label_email")}
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.email}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {t("page_profile_label_mobile")}
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.mobile}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {t("page_profile_label_location")}
                </h3>
                <div className="space-y-0.5">
                  <p className="text-lg font-medium">
                    {brokerCompanyDetails.city}
                  </p>
                  {brokerCompanyDetails.officeAddress && (
                    <p className="text-sm text-muted-foreground">
                      {brokerCompanyDetails.officeAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> {t("page_profile_label_gstin")}
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.gstin || t("page_profile_na")}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> {t("page_profile_label_employees")}
                </h3>
                <p className="text-lg font-medium">
                  {brokerCompanyDetails.noOfEmployees || 0}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" /> {t("page_profile_label_status")}
                </h3>
                <Badge
                  variant={
                    brokerCompanyDetails.status === "approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {brokerCompanyDetails.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {brokerProfile.companyName || t("page_profile_company_details")}
                </CardTitle>
                <CardDescription>
                  {t("page_profile_associated_company")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> {t("page_profile_label_gstin")}
                </h3>
                <p className="text-lg font-medium">
                  {brokerProfile.gstin || t("page_profile_na")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
