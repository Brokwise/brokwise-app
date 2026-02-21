"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useGetProperty, useEditProperty } from "@/hooks/useProperty";
import { EditPropertyDTO, Facing, TenantType, CommercialFurnishing } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, Star, AlertTriangle, Home } from "lucide-react";
import Image from "next/image";
import { FLAT_AMENITIES, VILLA_AMENITIES } from "@/constants";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { uploadFileToFirebase, generateFilePath, convertImageToWebP, processImageFromUrl } from "@/utils/upload";
import { Switch } from "@/components/ui/switch";
import { PageShell, PageHeader } from "@/components/ui/layout";

const BUILT_PROPERTY_TYPES = ["FLAT", "VILLA", "HOTEL", "HOSTEL", "RESORT", "SHOWROOM", "SHOP", "OFFICE_SPACE", "WAREHOUSE", "OTHER_SPACE"];

function EditPropertyPageContent() {
    const { t } = useTranslation();
    const facingOptions: { label: string; value: Facing }[] = [
        { label: t("label_north"), value: "NORTH" },
        { label: t("label_south"), value: "SOUTH" },
        { label: t("label_east"), value: "EAST" },
        { label: t("label_west"), value: "WEST" },
        { label: t("label_north_east"), value: "NORTH_EAST" },
        { label: t("label_north_west"), value: "NORTH_WEST" },
        { label: t("label_south_east"), value: "SOUTH_EAST" },
        { label: t("label_south_west"), value: "SOUTH_WEST" },
    ];

    const roadWidthUnits = [
        { label: t("label_meter"), value: "METER" },
        { label: t("label_feet"), value: "FEET" },
    ];
    const searchParams = useSearchParams();
    const router = useRouter();
    const propertyId = searchParams.get("id") || "";

    const { property, isLoading: isLoadingProperty, error: propertyError } = useGetProperty(propertyId);
    const { editProperty, isPending: isEditing } = useEditProperty();

    // Form state
    const [rate, setRate] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [isPriceNegotiable, setIsPriceNegotiable] = useState<boolean>(false);
    const [frontRoadWidth, setFrontRoadWidth] = useState<number | undefined>();
    const [sideRoadWidth, setSideRoadWidth] = useState<number | undefined>();
    const [roadWidthUnit, setRoadWidthUnit] = useState<"METER" | "FEET" | undefined>();
    const [facing, setFacing] = useState<Facing | undefined>();
    const [sideFacing, setSideFacing] = useState<Facing | undefined>();
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [featuredMedia, setFeaturedMedia] = useState<string>("");
    const [newImages, setNewImages] = useState<string[]>([]);
    const [imageUrlInput, setImageUrlInput] = useState<string>("");
    const [allImages, setAllImages] = useState<string[]>([]);
    const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

    // Rental fields
    const [monthlyRent, setMonthlyRent] = useState<number | undefined>();
    const [securityDeposit, setSecurityDeposit] = useState<number | undefined>();
    const [agreementDuration, setAgreementDuration] = useState<string>("");
    const [lockInPeriod, setLockInPeriod] = useState<number | undefined>();
    const [noticePeriod, setNoticePeriod] = useState<number | undefined>();
    const [tenantType, setTenantType] = useState<TenantType[]>([]);
    const [petsAllowed, setPetsAllowed] = useState<boolean>(false);
    const [nonVegAllowed, setNonVegAllowed] = useState<boolean>(false);
    const [furnishing, setFurnishing] = useState<CommercialFurnishing | undefined>();

    // Initialize form with property data
    useEffect(() => {
        if (property) {
            setRate(property.rate || 0);
            setTotalPrice(property.totalPrice || 0);
            setIsPriceNegotiable(property.isPriceNegotiable || false);
            setFrontRoadWidth(property.frontRoadWidth);
            setSideRoadWidth(property.sideRoadWidth);
            setRoadWidthUnit(property.roadWidthUnit);
            setFacing(property.facing);
            setSideFacing(property.sideFacing);
            setSelectedAmenities(property.amenities || []);
            setFeaturedMedia(property.featuredMedia || "");
            setAllImages(property.images || []);

            // Rental fields
            setMonthlyRent(property.monthlyRent);
            setSecurityDeposit(property.securityDeposit);
            setAgreementDuration(property.agreementDuration || "");
            setLockInPeriod(property.lockInPeriod);
            setNoticePeriod(property.noticePeriod);
            setTenantType(property.tenantType || []);
            setPetsAllowed(property.petsAllowed || false);
            setNonVegAllowed(property.nonVegAllowed || false);
            setFurnishing(property.furnishing);
        }
    }, [property]);

    // Get amenities based on property type
    const getAmenities = useCallback(() => {
        if (!property) return FLAT_AMENITIES;
        if (property.propertyType === "VILLA") return VILLA_AMENITIES;
        return FLAT_AMENITIES;
    }, [property]);

    const handleAmenityToggle = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSetCoverPhoto = (imageUrl: string) => {
        setFeaturedMedia(imageUrl);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadPromises = Array.from(files).map(async (file) => {
            try {
                const webpFile = await convertImageToWebP(file);
                const path = generateFilePath(webpFile.name, "property-images");
                const url = await uploadFileToFirebase(webpFile, path);
                return url;
            } catch (error) {
                console.error("Error uploading file:", error);
                return null;
            }
        });

        toast.loading(t("toast_uploading_images"));

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter((url): url is string => url !== null);

        if (validUrls.length > 0) {
            setNewImages(prev => [...prev, ...validUrls]);
            setAllImages(prev => [...prev, ...validUrls]);
            toast.dismiss();
            toast.success(t("toast_images_upload_success", { count: validUrls.length }));
        } else {
            toast.dismiss();
            toast.error(t("toast_images_upload_error"));
        }

        // Reset file input
        e.target.value = "";
    };

    const [isProcessingUrl, setIsProcessingUrl] = useState(false);

    const handleAddImageUrl = async () => {
        if (!imageUrlInput) return;
        if (!imageUrlInput.startsWith("http")) {
            toast.error("Please enter a valid URL starting with http");
            return;
        }

        try {
            setIsProcessingUrl(true);
            toast.info(t("toast_processing_image"));

            // Process the URL: fetch, convert if HEIC, optimize to WebP, and upload to our storage
            const optimizedUrl = await processImageFromUrl(imageUrlInput, "property-images");

            setNewImages(prev => [...prev, optimizedUrl]);
            setAllImages(prev => [...prev, optimizedUrl]);
            setImageUrlInput("");
            toast.success(t("toast_image_added"));
        } catch (error) {
            console.error("Error adding image URL:", error);
            toast.error(t("toast_image_url_error"));
        } finally {
            setIsProcessingUrl(false);
        }
    };

    const handleRemoveNewImage = (url: string) => {
        setNewImages(prev => prev.filter(img => img !== url));
        setAllImages(prev => prev.filter(img => img !== url));
        if (featuredMedia === url) setFeaturedMedia(allImages[0] || "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!propertyId) return;

        const isRental = (property?.listingPurpose || "SALE") === "RENT";

        const errors: Record<string, boolean> = {};
        if (!isRental) {
            if (rate <= 0) errors.rate = true;
            if (totalPrice <= 0) errors.totalPrice = true;
        } else {
            if (!monthlyRent || monthlyRent <= 0) errors.monthlyRent = true;
            if (securityDeposit === undefined || securityDeposit < 0) errors.securityDeposit = true;
            if (!agreementDuration) errors.agreementDuration = true;
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error(t("toast_fill_required"));
            return;
        }

        setValidationErrors({});

        const payload: EditPropertyDTO = {
            propertyId,
            rate: isRental ? undefined : rate,
            totalPrice: isRental ? undefined : totalPrice,
            isPriceNegotiable,
            frontRoadWidth,
            sideRoadWidth,
            roadWidthUnit,
            facing: facing || undefined,
            sideFacing: sideFacing || undefined,
            amenities: selectedAmenities,
            featuredMedia,
            newImages: newImages.length > 0 ? newImages : undefined,
            ...(isRental && {
                monthlyRent,
                securityDeposit,
                agreementDuration,
                lockInPeriod,
                noticePeriod,
                tenantType: tenantType.length > 0 ? tenantType : undefined,
                petsAllowed,
                nonVegAllowed,
                furnishing,
            }),
        };

        try {
            await editProperty(payload);
            router.push("/my-listings");
        } catch (error) {
            console.error("Error editing property:", error);
        }
    };

    if (!propertyId) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t("action_back")}
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t("error_title")}</AlertTitle>
                    <AlertDescription>
                        No property ID provided.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isLoadingProperty) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (propertyError || !property) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t("action_back")}
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t("error_title")}</AlertTitle>
                    <AlertDescription>
                        {t("error_property_not_found")}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Check if property can be edited
    const canEdit = ["ACTIVE", "PENDING_APPROVAL", "REJECTED"].includes(property.listingStatus);
    const MAX_EDITS = 3;
    const currentEditCount = property.editCount || 0;
    const editsRemaining = MAX_EDITS - currentEditCount;
    const hasReachedLimit = editsRemaining <= 0;

    if (!canEdit) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t("action_back")}
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t("error_title")}</AlertTitle>
                    <AlertDescription>
                        {t("error_property_cannot_edit")}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (hasReachedLimit) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t("action_back")}
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t("edit_property_limit_reached_title")}</AlertTitle>
                    <AlertDescription>
                        {t("edit_property_limit_reached_desc")}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <PageShell>
            <PageHeader
                title={t("page_edit_property_title")}
                description={property.propertyId || t("property_id_not_available")}
            />

            {/* Edit Count Info */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">
                    {t("edit_property_edit_count", { current: currentEditCount + 1, total: MAX_EDITS })}
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                    {t("edit_property_edits_remaining", { count: editsRemaining })}
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Listing Purpose Badge */}
                {property.listingPurpose === "RENT" && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                        <Home className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Rental Property</span>
                    </div>
                )}

                {/* Price Section - conditional based on listing purpose */}
                {(property.listingPurpose || "SALE") === "SALE" ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("edit_property_price_section")}</CardTitle>
                            <CardDescription>{t("edit_property_price_desc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rate">{t("label_rate_per_unit")} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    value={rate}
                                    onChange={(e) => {
                                        setRate(Number(e.target.value));
                                        setValidationErrors(prev => ({ ...prev, rate: false }));
                                    }}
                                    min={0}
                                    className={validationErrors.rate ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {validationErrors.rate && <p className="text-xs text-destructive">{t("validation_rate_required")}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalPrice">{t("label_total_price")} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="totalPrice"
                                    type="number"
                                    value={totalPrice}
                                    onChange={(e) => {
                                        setTotalPrice(Number(e.target.value));
                                        setValidationErrors(prev => ({ ...prev, totalPrice: false }));
                                    }}
                                    min={0}
                                    className={validationErrors.totalPrice ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {validationErrors.totalPrice && <p className="text-xs text-destructive">{t("validation_total_positive")}</p>}
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="isPriceNegotiable" className="text-sm font-medium cursor-pointer">
                                            {t("label_price_negotiable")}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {t("label_price_negotiable_desc")}
                                        </p>
                                    </div>
                                    <Switch
                                        id="isPriceNegotiable"
                                        checked={isPriceNegotiable}
                                        onCheckedChange={setIsPriceNegotiable}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Rental Details</CardTitle>
                            <CardDescription>Update rent, deposit and lease terms</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyRent">Monthly Rent (₹) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="monthlyRent"
                                        type="number"
                                        value={monthlyRent || ""}
                                        onChange={(e) => {
                                            setMonthlyRent(Number(e.target.value));
                                            setValidationErrors(prev => ({ ...prev, monthlyRent: false }));
                                        }}
                                        min={1}
                                        className={validationErrors.monthlyRent ? "border-destructive" : ""}
                                    />
                                    {validationErrors.monthlyRent && <p className="text-xs text-destructive">Monthly rent is required</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="securityDeposit">Security Deposit (₹) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="securityDeposit"
                                        type="number"
                                        value={securityDeposit ?? ""}
                                        onChange={(e) => {
                                            setSecurityDeposit(Number(e.target.value));
                                            setValidationErrors(prev => ({ ...prev, securityDeposit: false }));
                                        }}
                                        min={0}
                                        className={validationErrors.securityDeposit ? "border-destructive" : ""}
                                    />
                                    {validationErrors.securityDeposit && <p className="text-xs text-destructive">Security deposit is required</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agreementDuration">Agreement Duration <span className="text-destructive">*</span></Label>
                                    <Select value={agreementDuration} onValueChange={(val) => {
                                        setAgreementDuration(val);
                                        setValidationErrors(prev => ({ ...prev, agreementDuration: false }));
                                    }}>
                                        <SelectTrigger className={validationErrors.agreementDuration ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["6 months", "11 months", "1 year", "2 years", "3 years", "5 years"].map((d) => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {validationErrors.agreementDuration && <p className="text-xs text-destructive">Duration is required</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lockInPeriod">Lock-in (months)</Label>
                                    <Input
                                        id="lockInPeriod"
                                        type="number"
                                        value={lockInPeriod || ""}
                                        onChange={(e) => setLockInPeriod(e.target.value ? Number(e.target.value) : undefined)}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="noticePeriod">Notice (months)</Label>
                                    <Input
                                        id="noticePeriod"
                                        type="number"
                                        value={noticePeriod || ""}
                                        onChange={(e) => setNoticePeriod(e.target.value ? Number(e.target.value) : undefined)}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium cursor-pointer">{t("label_price_negotiable")}</Label>
                                    <p className="text-xs text-muted-foreground">{t("label_price_negotiable_desc")}</p>
                                </div>
                                <Switch checked={isPriceNegotiable} onCheckedChange={setIsPriceNegotiable} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Road Size Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t("edit_property_road_section")}</CardTitle>
                        <CardDescription>{t("edit_property_road_desc")}</CardDescription>
                    </CardHeader>
                    <CardContent className={`grid grid-cols-1 ${property?.plotType === "CORNER" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
                        <div className="space-y-2">
                            <Label htmlFor="frontRoadWidth">{t("label_front_road_width")}</Label>
                            <Input
                                id="frontRoadWidth"
                                type="number"
                                value={frontRoadWidth || ""}
                                onChange={(e) => setFrontRoadWidth(e.target.value ? Number(e.target.value) : undefined)}
                                min={0}
                                max={300}
                            />
                        </div>
                        {property?.plotType === "CORNER" && (
                            <div className="space-y-2">
                                <Label htmlFor="sideRoadWidth">{t("label_side_road_width")}</Label>
                                <Input
                                    id="sideRoadWidth"
                                    type="number"
                                    value={sideRoadWidth || ""}
                                    onChange={(e) => setSideRoadWidth(e.target.value ? Number(e.target.value) : undefined)}
                                    min={0}
                                    max={300}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="roadWidthUnit">{t("label_road_width_unit")}</Label>
                            <Select
                                value={roadWidthUnit}
                                onValueChange={(val) => setRoadWidthUnit(val as "METER" | "FEET")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("select_unit")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roadWidthUnits.map((unit) => (
                                        <SelectItem key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Directions Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t("edit_property_directions_section")}</CardTitle>
                        <CardDescription>{t("edit_property_directions_desc")}</CardDescription>
                    </CardHeader>
                    <CardContent className={`grid grid-cols-1 ${property?.plotType === "CORNER" ? "md:grid-cols-2" : ""} gap-4`}>
                        <div className="space-y-2">
                            <Label htmlFor="facing">{t("label_facing")}</Label>
                            <Select
                                value={facing}
                                onValueChange={(val) => setFacing(val as Facing)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("select_facing")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {facingOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {property?.plotType === "CORNER" && (
                            <div className="space-y-2">
                                <Label htmlFor="sideFacing">{t("label_side_facing")}</Label>
                                <Select
                                    value={sideFacing}
                                    onValueChange={(val) => setSideFacing(val as Facing)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("select_side_facing")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facingOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Amenities Section - Only for built property types */}
                {property && BUILT_PROPERTY_TYPES.includes(property.propertyType) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("edit_property_amenities_section")}</CardTitle>
                            <CardDescription>{t("edit_property_amenities_desc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {getAmenities().map((amenity) => (
                                    <div
                                        key={amenity.label}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={amenity.label}
                                            checked={selectedAmenities.includes(amenity.label)}
                                            onCheckedChange={() => handleAmenityToggle(amenity.label)}
                                        />
                                        <Label
                                            htmlFor={amenity.label}
                                            className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                                        >
                                            <amenity.icon className="w-3.5 h-3.5 text-muted-foreground" />
                                            {t(`amenity_${amenity.label.toLowerCase().replace(/ /g, "_").replace(/&/g, "").replace(/[()]/g, "").replace(/_+/g, "_").replace(/_$/, "")}`)}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Photos Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t("edit_property_photos_section")}</CardTitle>
                        <CardDescription>{t("edit_property_photos_desc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Existing Photos */}
                        <div>
                            <Label className="mb-2 block">{t("label_existing_photos")}</Label>
                            <p className="text-xs text-muted-foreground mb-3">
                                {t("edit_property_photos_cover_hint")}
                            </p>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {allImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${featuredMedia === image
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                        onClick={() => handleSetCoverPhoto(image)}
                                    >
                                        <Image
                                            src={image}
                                            alt={t("alt_property_image", { number: index + 1 })}
                                            fill
                                            className="object-cover"
                                        />
                                        {featuredMedia === image && (
                                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1">
                                                <Star className="w-3 h-3 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add New Photos */}
                        <div>
                            <Label className="mb-2 block">{t("label_add_new_photos")}</Label>
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="image-upload"
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm">{t("action_upload_images")}</span>
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {t("edit_property_photos_note")}
                                </span>
                            </div>

                            {/* Newly added images preview */}
                            {newImages.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {newImages.map((image, index) => (
                                        <div
                                            key={`new-${index}`}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-green-500 group"
                                        >
                                            <Image
                                                src={image}
                                                alt={t("alt_new_image", { number: index + 1 })}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {t("label_new")}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(image)}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <AlertTriangle className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Manual URL Input */}
                            <div className="mt-4 flex gap-2">
                                <Input
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder={t("placeholder_paste_image_url")}
                                    className="flex-1"
                                    disabled={isProcessingUrl}
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddImageUrl}
                                    variant="secondary"
                                    disabled={isProcessingUrl}
                                >
                                    {isProcessingUrl ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        t("action_add_url")
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        {t("action_cancel")}
                    </Button>
                    <Button type="submit" disabled={isEditing}>
                        {isEditing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t("action_saving")}
                            </>
                        ) : (
                            t("action_save_changes")
                        )}
                    </Button>
                </div>
            </form>
        </PageShell>
    );
}

export default function EditPropertyPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <EditPropertyPageContent />
        </Suspense>
    );
}
