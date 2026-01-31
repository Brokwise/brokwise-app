"use client";
import React, { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
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
  Pencil,
  X,
  Check,
  Camera,
  Calendar,
  User,
  Hash,
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
import { PageShell, PageHeader } from "@/components/ui/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileDetails } from "@/models/api/user";
import { uploadFileToFirebase, generateFilePath, convertImageToWebP } from "@/utils/upload";
import { cities } from "@/constants/cities";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { logError } from "@/utils/errors";

// Editable field component for inline editing
interface EditableFieldProps {
  label: string;
  value: string | number | undefined;
  icon: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  type?: "text" | "select" | "city" | "address" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  suffix?: string;
  editable?: boolean;
  loading?: boolean;
  maxLength?: number;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  icon,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  type = "text",
  options = [],
  placeholder = "",
  suffix = "",
  editable = true,
  loading = false,
  maxLength,
}) => {
  const [editValue, setEditValue] = useState(value?.toString() || "");
  const [openCity, setOpenCity] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const { t } = useTranslation();

  const handleSave = () => {
    onSave(editValue);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || "");
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "address") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon} {label}
        </h3>
        <div className="flex items-center gap-2">
          {type === "select" ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === "city" ? (
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  className={cn(
                    "flex-1 justify-between",
                    !editValue && "text-muted-foreground"
                  )}
                >
                  {editValue || placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder={t("onboarding_search_city")}
                    onValueChange={setCityQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <p className="p-2 text-sm text-muted-foreground">
                        {t("onboarding_no_city_found")}
                      </p>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 text-sm"
                        onClick={() => {
                          setEditValue(cityQuery);
                          setOpenCity(false);
                        }}
                      >
                        {t("onboarding_use_city")} &quot;{cityQuery}&quot;
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {cities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(currentValue) => {
                            setEditValue(
                              currentValue === editValue ? "" : currentValue
                            );
                            setOpenCity(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              editValue?.toLowerCase() === city.toLowerCase()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : type === "address" ? (
            <AddressAutocomplete
              valueLabel={editValue}
              valueId={editValue}
              placeholder={placeholder}
              className="flex-1"
              onSelect={(item) => setEditValue(item.place_name)}
              onClear={() => setEditValue("")}
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              type={type === "number" ? "number" : "text"}
              className="flex-1"
            />
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={loading}
            className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 group">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {icon} {label}
      </h3>
      <div className="flex items-center gap-2">
        <p className="text-lg font-medium flex-1">
          {value ? (
            <>
              {value}
              {suffix}
            </>
          ) : (
            <span className="text-muted-foreground italic">{t("page_profile_na")}</span>
          )}
        </p>
        {editable && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            className="h-8 w-8 opacity-100 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeavingCompany, setIsLeavingCompany] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [customLeaveReason, setCustomLeaveReason] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpdateField = async (field: string, value: string) => {
    if (!brokerData) return;

    try {
      setLoading(true);
      const updateData: Record<string, string | number> = { _id: brokerData._id };

      // Handle numeric fields
      if (field === "yearsOfExperience") {
        updateData[field] = parseInt(value) || 0;
      } else {
        updateData[field] = value;
      }

      await updateProfileDetails(updateData as Parameters<typeof updateProfileDetails>[0]);

      setBrokerData({
        ...brokerData,
        [field]: field === "yearsOfExperience" ? parseInt(value) || 0 : value,
      });

      toast.success(t("page_profile_update_success"));
      setEditingField(null);
    } catch (error) {
      logError({
        description: "Error updating profile field",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error(t("page_profile_update_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !brokerData) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("page_profile_image_too_large"));
      return;
    }

    try {
      setImageUploading(true);
      const optimizedFile = await convertImageToWebP(file);
      const path = generateFilePath(optimizedFile.name, `users/${user?.uid}/profile`);
      const url = await uploadFileToFirebase(optimizedFile, path);

      await updateProfileDetails({
        _id: brokerData._id,
        profilePhoto: url,
      });

      setBrokerData({
        ...brokerData,
        profilePhoto: url,
      });

      toast.success(t("page_profile_photo_updated"));
    } catch (error) {
      console.error(error);
      toast.error(t("page_profile_photo_error"));
    } finally {
      setImageUploading(false);
    }
  };

  const experienceOptions = [...Array(16)].map((_, index) => ({
    value: index.toString(),
    label: index === 15 ? "15+ " + t("page_profile_years") : `${index} ${index === 1 ? t("page_profile_year") : t("page_profile_years")}`,
  }));

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

  if (companyData) {
    return (
      <PageShell className="max-w-4xl">
        <PageHeader title={t("page_profile_company_title")} />

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
      </PageShell>
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

  const memberSince = brokerProfile.createdAt
    ? new Date(brokerProfile.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : null;

  return (
    <PageShell className="max-w-4xl">
      <PageHeader title={t("page_profile_title")} />

      {/* Profile Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Profile Photo with Edit */}
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={brokerProfile.profilePhoto} className="object-cover" />
                <AvatarFallback className="text-2xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
              >
                {imageUploading ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageUploading}
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    {brokerProfile.firstName} {brokerProfile.lastName}
                  </CardTitle>
                  <p className="text-muted-foreground">{brokerProfile.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    brokerProfile.status === "approved" ? "default" : "secondary"
                  }
                >
                  {brokerProfile.status.toUpperCase()}
                </Badge>
                {brokerProfile.brokerId && (
                  <Badge variant="outline">
                    <Hash className="h-3 w-3 mr-1" />
                    {brokerProfile.brokerId}
                  </Badge>
                )}
                {memberSince && (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {t("page_profile_member_since")} {memberSince}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("page_profile_personal_info")}
          </CardTitle>
          <CardDescription>{t("page_profile_personal_info_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableField
              label={t("page_profile_label_first_name")}
              value={brokerProfile.firstName}
              icon={<User className="h-4 w-4" />}
              isEditing={editingField === "firstName"}
              onEdit={() => setEditingField("firstName")}
              onSave={(value) => handleUpdateField("firstName", value)}
              onCancel={() => setEditingField(null)}
              placeholder={t("page_profile_placeholder_first_name")}
              loading={loading && editingField === "firstName"}
            />

            <EditableField
              label={t("page_profile_label_last_name")}
              value={brokerProfile.lastName}
              icon={<User className="h-4 w-4" />}
              isEditing={editingField === "lastName"}
              onEdit={() => setEditingField("lastName")}
              onSave={(value) => handleUpdateField("lastName", value)}
              onCancel={() => setEditingField(null)}
              placeholder={t("page_profile_placeholder_last_name")}
              loading={loading && editingField === "lastName"}
            />

            <EditableField
              label={t("page_profile_label_email")}
              value={brokerProfile.email}
              icon={<Mail className="h-4 w-4" />}
              isEditing={false}
              onEdit={() => { }}
              onSave={() => { }}
              onCancel={() => { }}
              editable={false}
            />

            <EditableField
              label={t("page_profile_label_mobile")}
              value={brokerProfile.mobile}
              icon={<Phone className="h-4 w-4" />}
              isEditing={editingField === "mobile"}
              onEdit={() => setEditingField("mobile")}
              onSave={(value) => handleUpdateField("mobile", value)}
              onCancel={() => setEditingField(null)}
              placeholder={t("page_profile_placeholder_mobile")}
              maxLength={10}
              loading={loading && editingField === "mobile"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t("page_profile_business_info")}
          </CardTitle>
          <CardDescription>{t("page_profile_business_info_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableField
              label={t("page_profile_label_company_name")}
              value={brokerProfile.companyName}
              icon={<Building2 className="h-4 w-4" />}
              isEditing={editingField === "companyName"}
              onEdit={() => setEditingField("companyName")}
              onSave={(value) => handleUpdateField("companyName", value)}
              onCancel={() => setEditingField(null)}
              placeholder={t("page_profile_placeholder_company")}
              loading={loading && editingField === "companyName"}
              editable={!brokerCompanyDetails}
            />

            <EditableField
              label={t("page_profile_label_gstin")}
              value={brokerProfile.gstin}
              icon={<FileText className="h-4 w-4" />}
              isEditing={editingField === "gstin"}
              onEdit={() => setEditingField("gstin")}
              onSave={(value) => handleUpdateField("gstin", value)}
              onCancel={() => setEditingField(null)}
              placeholder={t("page_profile_placeholder_gstin")}
              maxLength={15}
              loading={loading && editingField === "gstin"}
              editable={!brokerCompanyDetails}
            />

            <EditableField
              label={t("page_profile_label_experience")}
              value={brokerProfile.yearsOfExperience}
              icon={<Briefcase className="h-4 w-4" />}
              isEditing={editingField === "yearsOfExperience"}
              onEdit={() => setEditingField("yearsOfExperience")}
              onSave={(value) => handleUpdateField("yearsOfExperience", value)}
              onCancel={() => setEditingField(null)}
              type="select"
              options={experienceOptions}
              suffix={` ${brokerProfile.yearsOfExperience === 1 ? t("page_profile_year") : t("page_profile_years")}`}
              loading={loading && editingField === "yearsOfExperience"}
            />

            <EditableField
              label={t("page_profile_label_rera")}
              value={brokerProfile.reraNumber}
              icon={<Award className="h-4 w-4" />}
              isEditing={editingField === "reraNumber"}
              onEdit={() => setEditingField("reraNumber")}
              onSave={(value) => handleUpdateField("reraNumber", value)}
              onCancel={() => setEditingField(null)}
              placeholder={t("page_profile_placeholder_rera")}
              maxLength={50}
              loading={loading && editingField === "reraNumber"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("page_profile_location_info")}
          </CardTitle>
          <CardDescription>{t("page_profile_location_info_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <EditableField
              label={t("page_profile_label_city")}
              value={brokerProfile.city}
              icon={<MapPin className="h-4 w-4" />}
              isEditing={editingField === "city"}
              onEdit={() => setEditingField("city")}
              onSave={(value) => handleUpdateField("city", value)}
              onCancel={() => setEditingField(null)}
              type="city"
              placeholder={t("page_profile_placeholder_city")}
              loading={loading && editingField === "city"}
            />

            <EditableField
              label={t("page_profile_label_office_address")}
              value={brokerProfile.officeAddress}
              icon={<Building2 className="h-4 w-4" />}
              isEditing={editingField === "officeAddress"}
              onEdit={() => setEditingField("officeAddress")}
              onSave={(value) => handleUpdateField("officeAddress", value)}
              onCancel={() => setEditingField(null)}
              type="address"
              placeholder={t("page_profile_placeholder_address")}
              loading={loading && editingField === "officeAddress"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
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

      {/* Company Association Card */}
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
      ) : null}
    </PageShell>
  );
};

export default ProfilePage;
