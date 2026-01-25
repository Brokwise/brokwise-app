"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useGetProperty, useEditProperty } from "@/hooks/useProperty";
import { EditPropertyDTO, Facing } from "@/types/property";
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
import { ArrowLeft, Loader2, Upload, Star, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { FLAT_AMENITIES, VILLA_AMENITIES } from "@/constants";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FACING_OPTIONS: { label: string; value: Facing }[] = [
    { label: "North", value: "NORTH" },
    { label: "South", value: "SOUTH" },
    { label: "East", value: "EAST" },
    { label: "West", value: "WEST" },
    { label: "North East", value: "NORTH_EAST" },
    { label: "North West", value: "NORTH_WEST" },
    { label: "South East", value: "SOUTH_EAST" },
    { label: "South West", value: "SOUTH_WEST" },
];

const ROAD_WIDTH_UNITS = [
    { label: "Meter", value: "METER" },
    { label: "Feet", value: "FEET" },
];

export default function EditPropertyPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const propertyId = params.id as string;

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

        toast.info(t("toast_upload_images_info") || "Image upload coming soon. Please enter image URLs manually for now.");
    };

    const handleAddImageUrl = () => {
        if (!imageUrlInput) return;
        if (!imageUrlInput.startsWith("http")) {
            toast.error("Please enter a valid URL starting with http");
            return;
        }
        setNewImages(prev => [...prev, imageUrlInput]);
        setAllImages(prev => [...prev, imageUrlInput]);
        setImageUrlInput("");
    };

    const handleRemoveNewImage = (url: string) => {
        setNewImages(prev => prev.filter(img => img !== url));
        setAllImages(prev => prev.filter(img => img !== url));
        if (featuredMedia === url) setFeaturedMedia(allImages[0] || "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!propertyId) return;

        const payload: EditPropertyDTO = {
            propertyId,
            rate,
            totalPrice,
            isPriceNegotiable,
            frontRoadWidth,
            sideRoadWidth,
            roadWidthUnit,
            facing,
            sideFacing,
            amenities: selectedAmenities,
            featuredMedia,
            newImages: newImages.length > 0 ? newImages : undefined,
        };

        try {
            await editProperty(payload);
            router.push("/my-listings");
        } catch (error) {
            console.error("Error editing property:", error);
        }
    };

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

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t("action_back")}
                    </Button>
                    <div>
                        <h1 className="text-2xl font-instrument-serif">{t("page_edit_property_title")}</h1>
                        <p className="text-sm text-muted-foreground">
                            {property.propertyId || t("property_id_not_available")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Warning Alert */}
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("edit_property_warning_title")}</AlertTitle>
                <AlertDescription>
                    {t("edit_property_warning_desc")}
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Price Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t("edit_property_price_section")}</CardTitle>
                        <CardDescription>{t("edit_property_price_desc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate">{t("label_rate_per_unit")}</Label>
                            <Input
                                id="rate"
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalPrice">{t("label_total_price")}</Label>
                            <Input
                                id="totalPrice"
                                type="number"
                                value={totalPrice}
                                onChange={(e) => setTotalPrice(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id="isPriceNegotiable"
                                checked={isPriceNegotiable}
                                onCheckedChange={(val) => setIsPriceNegotiable(!!val)}
                            />
                            <Label htmlFor="isPriceNegotiable" className="text-sm font-normal cursor-pointer">
                                {t("label_price_negotiable") || "Price Negotiable"}
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Road Size Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t("edit_property_road_section")}</CardTitle>
                        <CardDescription>{t("edit_property_road_desc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    {ROAD_WIDTH_UNITS.map((unit) => (
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
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    {FACING_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                                    {FACING_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Amenities Section */}
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
                                        {amenity.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

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
                                            alt={`Property image ${index + 1}`}
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
                                                alt={`New image ${index + 1}`}
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
                                    placeholder={t("placeholder_image_url") || "Enter image URL..."}
                                    className="flex-1"
                                />
                                <Button type="button" onClick={handleAddImageUrl} variant="secondary">
                                    {t("action_add_url") || "Add URL"}
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
        </div>
    );
}
