import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Check,
    User,
    Camera,
    ShieldCheck,
    Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { uploadFileToFirebase, generateFilePath, convertImageToWebP } from "@/utils/upload";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { useTranslation } from "react-i18next";
import { RequiredLabel } from "@/components/ui/required-label";
import { Button } from "@/components/ui/button";
import { COUNTRY_CODES } from "@/constants";
import useAxios from "@/hooks/useAxios";
import { KycState } from "@/models/types/kyc";

interface Step1Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    selectedCountry: string;
    setSelectedCountry: (value: string) => void;
    kycState: KycState;
    onStartKyc: () => void;
    onOpenDigiLocker: () => void;
    isEditing?: boolean;
}

export const Step1: React.FC<Step1Props> = ({
    form,
    selectedCountry,
    setSelectedCountry,
    kycState,
    isEditing = false,
}) => {
    const [user] = useAuthState(firebaseAuth);
    const { t } = useTranslation();
    const api = useAxios();

    const [imageUploading, setImageUploading] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);
    const [hasNotified, setHasNotified] = useState(false);
    const [notifyMobile, setNotifyMobile] = useState("");

    const isIndianNumber = selectedCountry === "+91";
    const isKycVerified = kycState.status === "verified";
    const isFieldLocked = isKycVerified && isIndianNumber && !isEditing;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        try {
            setImageUploading(true);
            const optimizedFile = await convertImageToWebP(file);
            const path = generateFilePath(optimizedFile.name, `users/${user?.uid}/profile`);
            const url = await uploadFileToFirebase(optimizedFile, path);
            form.setValue("profilePhoto", url, {
                shouldValidate: true,
                shouldDirty: true,
            });
            toast.success("Profile photo uploaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload photo");
        } finally {
            setImageUploading(false);
        }
    };

    const handleNotifyMe = async () => {
        if (isNotifying || hasNotified) return;
        setIsNotifying(true);
        try {
            const payload: Record<string, string> = {
                countryCode: selectedCountry,
                countryLabel:
                    COUNTRY_CODES.find((country) => country.value === selectedCountry)
                        ?.label ?? "",
                source: "broker-onboarding",
            };
            if (user?.email) payload.email = user.email;
            if (notifyMobile.trim()) payload.phone = notifyMobile.trim();
            else if (user?.phoneNumber) payload.phone = user.phoneNumber;
            if (user?.uid) payload.userId = user.uid;

            await api.post("/notify", payload);
            setHasNotified(true);
            toast.success(t("notify_me_success"));
        } catch (error) {
            console.error(error);
            toast.error(t("generic_error"));
        } finally {
            setIsNotifying(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* ─── Profile Photo ────────────────────────────────────────── */}
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-sm dark:border-slate-800">
                        <AvatarImage
                            src={form.watch("profilePhoto")}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <User className="h-10 w-10" />
                        </AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="profile-photo-upload"
                        className="absolute bottom-0 right-0 p-2 bg-[#0F172A] text-white rounded-full cursor-pointer hover:bg-[#1E293B] transition-colors shadow-sm dark:bg-white dark:text-slate-900"
                    >
                        {imageUploading ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Camera className="h-4 w-4" />
                        )}
                        <input
                            id="profile-photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={imageUploading}
                        />
                    </label>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {t("onboarding_profile_photo")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("onboarding_profile_photo_hint")}
                    </p>
                </div>
            </div>

            {/* ─── KYC Verification Section (Indian users, non-editing) ── */}
            {/* {isIndianNumber && !isEditing && (
                <KycVerificationCard
                    kycState={kycState}
                    onStartKyc={onStartKyc}
                    onOpenDigiLocker={onOpenDigiLocker}
                    t={t}
                />
            )} */}

            {/* ─── Locked fields hint ───────────────────────────────────── */}
            {isFieldLocked && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/60 px-3 py-2.5 dark:border-green-800/50 dark:bg-green-950/20">
                    <Lock className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                    <p className="text-xs text-green-700 dark:text-green-400">
                        {t("kyc_fields_locked_hint")}
                    </p>
                </div>
            )}

            {/* ─── Name Fields ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <RequiredLabel>
                                    {t("onboarding_first_name")}
                                </RequiredLabel>
                                {isFieldLocked && (
                                    <ShieldCheck className="inline h-3.5 w-3.5 ml-1.5 text-green-600 dark:text-green-400" />
                                )}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={isFieldLocked}
                                    readOnly={isFieldLocked}
                                    className={`h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all ${isFieldLocked
                                        ? "bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-80"
                                        : ""
                                        }`}
                                    placeholder="e.g. John"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <RequiredLabel>
                                    {t("onboarding_last_name")}
                                </RequiredLabel>
                                {isFieldLocked && (
                                    <ShieldCheck className="inline h-3.5 w-3.5 ml-1.5 text-green-600 dark:text-green-400" />
                                )}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={isFieldLocked}
                                    readOnly={isFieldLocked}
                                    className={`h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all ${isFieldLocked
                                        ? "bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-80"
                                        : ""
                                        }`}
                                    placeholder="e.g. Doe"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* ─── Mobile Number ─────────────────────────────────────────── */}
            <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            <RequiredLabel>
                                {t("onboarding_mobile_number")}
                            </RequiredLabel>
                            {isFieldLocked && (
                                <ShieldCheck className="inline h-3.5 w-3.5 ml-1.5 text-green-600 dark:text-green-400" />
                            )}
                        </FormLabel>
                        <FormControl>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedCountry}
                                    onValueChange={setSelectedCountry}
                                    disabled={isFieldLocked}
                                >
                                    <SelectTrigger
                                        className={`w-[160px] h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all ${isFieldLocked
                                            ? "bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-80"
                                            : ""
                                            }`}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRY_CODES.map((country) => (
                                            <SelectItem
                                                key={country.code}
                                                value={country.value}
                                            >
                                                {country.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input
                                    {...field}
                                    type="tel"
                                    maxLength={10}
                                    className={`flex-1 h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all ${isFieldLocked || !isIndianNumber
                                        ? "bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-80"
                                        : ""
                                        }`}
                                    placeholder="e.g. 9876543210"
                                    disabled={isFieldLocked || !isIndianNumber}
                                    readOnly={isFieldLocked}
                                    onChange={(e) => {
                                        if (isFieldLocked) return;
                                        const value = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 10);
                                        field.onChange(value);
                                    }}
                                />
                            </div>
                        </FormControl>
                        {isIndianNumber && !isFieldLocked && (
                            <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                {t("mobile_aadhaar_hint")}
                            </FormDescription>
                        )}
                        {!isIndianNumber && (
                            <div className="mt-2 space-y-2">
                                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                                    <p className="leading-snug">
                                        {t("coming_soon_country")}
                                    </p>
                                </div>
                                {hasNotified ? (
                                    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                                        <Check className="h-4 w-4" />
                                        <span>{t("notify_me_success")}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="tel"
                                            maxLength={15}
                                            value={notifyMobile}
                                            onChange={(e) =>
                                                setNotifyMobile(
                                                    e.target.value.replace(/[^\d+]/g, "")
                                                )
                                            }
                                            className="flex-1 h-10 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                            placeholder={t("notify_mobile_placeholder")}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-10 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                            onClick={handleNotifyMe}
                                            disabled={isNotifying}
                                        >
                                            {isNotifying ? t("submitting") : t("notify_me")}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                        {isIndianNumber && !isFieldLocked && <FormMessage />}
                    </FormItem>
                )}
            />
        </div>
    );
};

// ─── KYC Verification Card ──────────────────────────────────────────────────

// function KycVerificationCard({
//     kycState,
//     onStartKyc,
//     onOpenDigiLocker,
//     t,
// }: {
//     kycState: KycState;
//     onStartKyc: () => void;
//     onOpenDigiLocker: () => void;
//     t: (key: string) => string;
// }) {
//     const { status } = kycState;

//     // Shared card wrapper
//     const cardClass = (variant: "blue" | "green" | "red" | "amber") => {
//         const colors = {
//             blue: "border-blue-200 bg-blue-50/80 dark:border-blue-800/60 dark:bg-blue-950/20",
//             green: "border-green-200 bg-green-50/80 dark:border-green-800/60 dark:bg-green-950/20",
//             red: "border-red-200 bg-red-50/80 dark:border-red-800/60 dark:bg-red-950/20",
//             amber: "border-amber-200 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-950/20",
//         };
//         return `rounded-xl border-2 p-5 transition-all ${colors[variant]}`;
//     };

//     // ─── Not Started ────────────────────────────────────────────────────────
//     if (status === "not_started") {
//         return (
//             <div className={cardClass("blue")}>
//                 <div className="flex items-start gap-3 mb-4">
//                     <div className="rounded-lg bg-blue-100 dark:bg-blue-900/40 p-2.5 shrink-0">
//                         <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <div className="min-w-0">
//                         <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
//                             {t("kyc_verify_identity")}
//                         </h3>
//                         <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
//                             {t("kyc_verify_desc")}
//                         </p>
//                     </div>
//                 </div>
//                 <Button
//                     type="button"
//                     onClick={onStartKyc}
//                     className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 font-medium"
//                 >
//                     <ExternalLink className="mr-2 h-4 w-4" />
//                     {t("kyc_verify_button")}
//                 </Button>
//             </div>
//         );
//     }

//     // ─── Initiating ─────────────────────────────────────────────────────────
//     if (status === "initiating") {
//         return (
//             <div className={cardClass("blue")}>
//                 <div className="flex items-center gap-3">
//                     <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
//                     <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                         {t("kyc_initiating")}
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     // ─── Pending (polling) ──────────────────────────────────────────────────
//     if (status === "pending") {
//         return (
//             <div className={cardClass("amber")}>
//                 <div className="flex items-start gap-3 mb-3">
//                     <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2.5 shrink-0">
//                         <Loader2 className="h-5 w-5 animate-spin text-amber-600 dark:text-amber-400" />
//                     </div>
//                     <div className="min-w-0">
//                         <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
//                             {t("kyc_pending_title")}
//                         </h3>
//                         <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
//                             {t("kyc_pending_desc")}
//                         </p>
//                     </div>
//                 </div>
//                 <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
//                     {t("kyc_pending_hint")}
//                 </p>
//                 <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={onOpenDigiLocker}
//                     className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
//                 >
//                     <ExternalLink className="mr-2 h-3.5 w-3.5" />
//                     {t("kyc_open_digilocker")}
//                 </Button>
//             </div>
//         );
//     }

//     // ─── Verified ───────────────────────────────────────────────────────────
//     if (status === "verified") {
//         return (
//             <div className={cardClass("green")}>
//                 <div className="flex items-center gap-3">
//                     <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2.5 shrink-0">
//                         <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
//                     </div>
//                     <div className="min-w-0">
//                         <h3 className="font-semibold text-green-800 dark:text-green-300 text-sm">
//                             {t("kyc_verified_title")}
//                         </h3>
//                         <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
//                             {t("kyc_verified_desc")}
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // ─── Failed / Expired ───────────────────────────────────────────────────
//     if (status === "failed" || status === "expired") {
//         return (
//             <div className={cardClass("red")}>
//                 <div className="flex items-start gap-3 mb-3">
//                     <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2.5 shrink-0">
//                         <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
//                     </div>
//                     <div className="min-w-0">
//                         <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm">
//                             {status === "expired"
//                                 ? t("kyc_expired_title")
//                                 : t("kyc_failed_title")}
//                         </h3>
//                         <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">
//                             {status === "expired"
//                                 ? t("kyc_expired_desc")
//                                 : t("kyc_failed_desc")}
//                         </p>
//                     </div>
//                 </div>
//                 <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={onStartKyc}
//                     className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
//                 >
//                     {t("kyc_retry")}
//                 </Button>
//             </div>
//         );
//     }

//     return null;
// }
