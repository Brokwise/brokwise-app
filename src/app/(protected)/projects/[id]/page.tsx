"use client";

import React from "react";
import { useGetProject, useGetProjectPlots } from "@/hooks/useProject";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  FileText,
  ArrowLeft,
  Loader2,
  Building2,
  Layers,
  LayoutGrid,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plot } from "@/models/types/project";
import { BookingDialog } from "./_components/BookingDialog";
import { ProjectMap } from "./_components/ProjectMap";
import { ProjectSitePlan } from "./_components/ProjectSitePlan";
import { useApp } from "@/context/AppContext";
import { CountdownTimer } from "@/components/ui/countdown-timer";

const ProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { project, stats, isLoading, error } = useGetProject(id);
  const { plots, isLoading: isLoadingPlots } = useGetProjectPlots(id, {
    limit: 100,
  });
  const { brokerData } = useApp();

  const [selectedPlots, setSelectedPlots] = React.useState<Plot[]>([]);
  const [activeBlock, setActiveBlock] = React.useState<string>("all");
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [bookingMode, setBookingMode] = React.useState<"book" | "hold">("book");

  const blocks = React.useMemo(() => {
    if (!plots) return [];
    const blockMap = new Map();
    plots.forEach((plot) => {
      if (plot.blockId) {
        blockMap.set(plot.blockId._id, plot.blockId.name);
      }
    });
    return Array.from(blockMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [plots]);

  const filteredPlots = React.useMemo(() => {
    if (!plots) return [];
    if (activeBlock === "all") return plots;
    return plots.filter((plot) => plot.blockId?._id === activeBlock);
  }, [plots, activeBlock]);

  const togglePlotSelection = (plot: Plot) => {
    setSelectedPlots((prev) => {
      const exists = prev.find((p) => p._id === plot._id);
      if (exists) {
        return prev.filter((p) => p._id !== plot._id);
      }
      return [...prev, plot];
    });
  };

  const isSelected = (plotId: string) => {
    return selectedPlots.some((p) => p._id === plotId);
  };

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
    <main className="container mx-auto py-8  space-y-8 relative mb-20">
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

          {/* Plots Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Plots</CardTitle>
              {blocks.length > 0 && (
                <Tabs
                  value={activeBlock}
                  onValueChange={setActiveBlock}
                  className="w-[200px] sm:w-[300px]"
                >
                  <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {blocks.map((block) => (
                      <TabsTrigger key={block.id} value={block.id}>
                        {block.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingPlots ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : filteredPlots && filteredPlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredPlots.map((plot) => {
                    const selected = isSelected(plot._id);
                    return (
                      <div
                        key={plot._id}
                        className={`p-4 border rounded-lg flex flex-col items-center gap-2 relative group transition-all duration-200 ${
                          plot.status === "available"
                            ? selected
                              ? "bg-primary/5 border-primary shadow-sm"
                              : "bg-card hover:border-primary cursor-pointer hover:shadow-sm"
                            : "bg-muted/50 opacity-80"
                        }`}
                        onClick={() => {
                          if (plot.status === "available") {
                            togglePlotSelection(plot);
                          }
                        }}
                      >
                        {plot.status === "available" && (
                          <div className="absolute top-2 right-2">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => togglePlotSelection(plot)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </div>
                        )}
                        <span className="font-bold text-lg mt-2">
                          {plot.plotNumber}
                        </span>
                        <div className="text-xs text-muted-foreground text-center space-y-0.5">
                          <div>
                            {plot.area} {plot.areaUnit}
                          </div>
                          <div>{plot.facing}</div>
                        </div>
                        <Badge
                          variant={
                            plot.status === "available"
                              ? "outline"
                              : "secondary"
                          }
                          className={`mt-1 text-[10px] px-2 py-0.5 h-5 ${
                            plot.status === "available"
                              ? "border-green-500 text-green-600 bg-green-50"
                              : plot.status === "booked"
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : plot.status === "on_hold"
                              ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {plot.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        {plot.status === "available" && (
                          <div className="text-sm font-semibold mt-1 text-primary">
                            {formatCurrency(project.bookingTokenAmount)}
                          </div>
                        )}
                        {plot.status === "on_hold" && plot.holdExpiresAt && (
                          <div className="mt-1">
                            <CountdownTimer
                              expiresAt={plot.holdExpiresAt}
                              className="text-orange-600 justify-center font-bold"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No plots found for this selection.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Map */}
          {project.location?.coordinates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                <ProjectMap
                  coordinates={project.location.coordinates}
                  name={project.name}
                />
              </CardContent>
            </Card>
          )}

          {/* Site Plan */}
          {project.sitePlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Site Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                <ProjectSitePlan url={project.sitePlan} />
              </CardContent>
            </Card>
          )}

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

      {/* Floating Selection Bar */}
      {selectedPlots.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-foreground text-background rounded-full shadow-lg p-3 flex items-center justify-between pl-6">
            <div className="flex flex-col">
              <span className="font-bold">
                {selectedPlots.length} Plot{selectedPlots.length > 1 ? "s" : ""}{" "}
                Selected
              </span>
              <span className="text-xs text-muted-foreground/80">
                Total:{" "}
                {formatCurrency(
                  selectedPlots.reduce((sum, p) => sum + p.price, 0)
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 rounded-full hover:bg-background/20"
                onClick={() => setSelectedPlots([])}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="rounded-full px-6"
                onClick={() => {
                  setBookingMode("book");
                  setIsBookingOpen(true);
                }}
              >
                Book Now
              </Button>
              {brokerData && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full px-6 text-foreground"
                  onClick={() => {
                    setBookingMode("hold");
                    setIsBookingOpen(true);
                  }}
                >
                  Hold
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        plots={selectedPlots}
        projectId={id}
        onSuccess={() => setSelectedPlots([])}
        mode={bookingMode}
      />
    </main>
  );
};

export default ProjectPage;
