"use client";

import React from "react";
import { useGetProject } from "@/hooks/useProject";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  FileText,
  ArrowLeft,
  Loader2,
  Building2,
  Ruler,
  CheckCircle2,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";

const ProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { project, stats, isLoading, error } = useGetProject(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error?.message || "Project not found"}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allImages = project.images || [];

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {project.name}
              <span className="text-muted-foreground font-normal text-sm bg-muted px-2 py-1 rounded-md">
                ID: {project.projectId || "N/A"}
              </span>
            </h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {formatAddress(project.address)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="rounded-xl overflow-hidden bg-muted aspect-video relative border">
            {allImages.length > 0 ? (
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full">
                  {allImages.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="relative w-full h-full flex items-center justify-center bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={`Project ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/placeholder.webp";
                          }}
                        />
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
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No images available
              </div>
            )}
          </div>

          {/* Overview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                    <Building2 className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold text-sm capitalize">
                      {project.projectType}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Use</p>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                    <Layers className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold text-sm capitalize">
                      {project.projectUse}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Plots</p>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                    <LayoutGrid className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold text-sm">
                      {project.numberOfPlots}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {project.approvalDocuments &&
            project.approvalDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Approval Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.approvalDocuments.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline p-2 hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Document {index + 1}
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    project.projectStatus === "active" ? "default" : "secondary"
                  }
                  className={
                    project.projectStatus === "active"
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                >
                  {project.projectStatus.toUpperCase()}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Development
                </span>
                <span className="font-medium text-sm">
                  {project.developmentStatus.replace(/-/g, " ").toUpperCase()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Legal</span>
                <span className="font-medium text-sm">
                  {project.legalStatus.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">RERA</span>
                <span className="font-medium text-sm">
                  {project.reraNumber}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Plot Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Plot Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Available
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {stats.available}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Booked</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {stats.booked}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Reserved
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    {stats.reserved}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sold</span>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    {stats.sold}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Possession Date
                </p>
                <p className="font-semibold">
                  {format(new Date(project.possessionDate), "PPP")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created On</p>
                <p className="font-semibold">
                  {format(new Date(project.createdAt), "PPP")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ProjectPage;
