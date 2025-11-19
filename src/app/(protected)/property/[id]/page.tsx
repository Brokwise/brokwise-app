"use client";

import React, { useState } from "react";
import { useGetProperty } from "@/hooks/useProperty";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MapPin,
  IndianRupee,
  Home,
  Edit,
  Calendar,
  User,
  Building,
  Bed,
  Bath,
  Maximize2,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import { format } from "date-fns";
import { MapBox } from "./_components/mapBox";
import { KeyFeatures } from "./_components/keyFeatures";
import { AdditionalDetails } from "./_components/additionalDetails";
import { formatCurrency } from "@/utils/helper";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { P } from "@/components/text/p";

const PropertyPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { property, isLoading, error } = useGetProperty(id);
  const [user] = useAuthState(firebaseAuth);
  const status = useSearchParams().get("status");
  const owner = property?.listedBy.email === user?.email;
  console.log(status, property?.listingStatus, owner);
  const [showStatusDialog, setShowStatusDialog] = useState(
    status?.toString().toLowerCase() === "pending_approval" &&
      property?.listingStatus?.toString().toLowerCase() ===
        "pending_approval" &&
      owner
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      PENDING_APPROVAL: { variant: "secondary", icon: Loader2 },
      APPROVED: { variant: "default", icon: CheckCircle2 },
      REJECTED: { variant: "destructive", icon: XCircle },
    };
    const { variant, icon: Icon } = statusMap[status] || {
      variant: "outline" as const,
      icon: FileText,
    };
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const allImages = [
    ...(property.featuredMedia ? [property.featuredMedia] : []),
    ...property.images,
  ];

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Dialog
        open={showStatusDialog}
        onOpenChange={(open) => setShowStatusDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Property Status</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <P text="Your property is pending approval. Please wait for it to be approved." />
          </DialogDescription>
        </DialogContent>
      </Dialog>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-sm">
                {property.propertyId || "N/A"}
              </Badge>
              {getStatusBadge(property.listingStatus)}
              {property.isFeatured && (
                <Badge variant="default" className="bg-amber-500">
                  Featured
                </Badge>
              )}
              {property.isVerified && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {property.propertyCategory} - {property.propertyType}
            </h1>
            <div className="flex items-center text-muted-foreground gap-1">
              <MapPin className="h-4 w-4" />
              <span>{property.address}</span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-3xl font-bold text-primary flex items-center">
              <IndianRupee className="h-7 w-7" />
              {formatCurrency(property.totalPrice)}
            </div>
            <div className="text-sm text-muted-foreground">
              Rate: {formatCurrency(property.rate)}/
              {property.sizeUnit?.toLowerCase() || "unit"}
            </div>
            {property.isPriceNegotiable && (
              <Badge variant="secondary" className="text-xs">
                Negotiable
              </Badge>
            )}
          </div>
        </div>

        {owner && (
          <Button size="lg" className="w-full md:w-auto gap-2">
            <Edit className="h-4 w-4" />
            Edit Property
          </Button>
        )}
      </div>

      {/* Image Gallery */}
      {allImages.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <Carousel className="w-full">
              <CarouselContent>
                {allImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {image.endsWith(".mp4") ? (
                        <video
                          src={image}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/images/propertyCategory/residential.jpg";
                          }}
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {allImages.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {property.description}
              </p>
            </CardContent>
          </Card>

          <KeyFeatures property={property} />
          <AdditionalDetails property={property} />

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Localities */}
          {property.localities && property.localities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nearby Localities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.localities.map((locality, index) => (
                    <Badge key={index} variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {locality}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {(property.floorPlans?.length ||
            property.jamabandiUrl ||
            property.khasraPlanUrl) && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.floorPlans?.map((plan, index) => (
                  <a
                    key={index}
                    href={plan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Floor Plan {index + 1}
                  </a>
                ))}
                {property.jamabandiUrl && (
                  <a
                    href={property.jamabandiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Jamabandi Document
                  </a>
                )}
                {property.khasraPlanUrl && (
                  <a
                    href={property.khasraPlanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Khasra Plan
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Location Map */}
          <MapBox property={property} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Listed By */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Listed By
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="font-semibold">
                  {property.listedBy.firstName} {property.listedBy.lastName}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold break-all">
                  {property.listedBy.email}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mobile</p>
                <p className="font-semibold">{property.listedBy.mobile}</p>
              </div>
              {property.listedBy.brokerId && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Broker ID
                    </p>
                    <Badge variant="outline">
                      {property.listedBy.brokerId}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Property Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Listed On</p>
                <p className="font-semibold">
                  {format(new Date(property.createdAt), "PPP")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="font-semibold">
                  {format(new Date(property.updatedAt), "PPP")}
                </p>
              </div>
              {property.verifiedBy && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Verified By
                    </p>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {property.verifiedBy}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact CTA */}
          {!owner && (
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">
                  Interested in this property?
                </h3>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full mb-2"
                  onClick={() => {
                    window.location.href = `tel:${property.listedBy.mobile}`;
                  }}
                >
                  Call Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => {
                    window.location.href = `mailto:${property.listedBy.email}`;
                  }}
                >
                  Send Email
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default PropertyPage;
