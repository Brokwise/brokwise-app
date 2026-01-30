"use client";

import React, { Suspense } from "react";
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
  Loader2,
  Building2,
  Layers,
  LayoutGrid,
  X,
  Ticket,
  CheckCircle2,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plot } from "@/models/types/project";
import { BookingDialog } from "../[id]/_components/BookingDialog";
import { ProjectMap } from "../[id]/_components/ProjectMap";
import { ProjectSitePlan } from "../[id]/_components/ProjectSitePlan";
import { useApp } from "@/context/AppContext";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PageShell, PageHeader } from "@/components/ui/layout";

const ProjectPageContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
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

  const scrollToBooking = () => {
    const element = document.getElementById("booking-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Project ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No project ID was provided.</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <PageShell className="mb-20">
      <PageHeader
        title={project.name}
        description={formatAddress(project.address)}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal text-xs">
            ID: {project.projectId || "N/A"}
          </Badge>
          <Button
            size="lg"
            className="w-full sm:w-auto font-semibold shadow-md"
            onClick={scrollToBooking}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Book Plots
          </Button>
        </div>
      </PageHeader>

      {/* Image Gallery */}
      <div className="rounded-xl overflow-hidden bg-muted h-[250px] sm:h-[350px] md:h-[450px] relative border shadow-sm group">
        {allImages.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {allImages.map((image, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="relative w-full h-full flex items-center justify-center bg-black/5">
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
                <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No images available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-muted/30 border-none shadow-none">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold capitalize">
                      {project.projectType}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-none shadow-none">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usage</p>
                    <p className="font-semibold capitalize">
                      {project.projectUse}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-none shadow-none col-span-2 md:col-span-1">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Plots</p>
                    <p className="font-semibold">{project.numberOfPlots}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {project.description}
            </p>
          </section>

          <Separator />

          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {project.amenities.map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-4 py-2 text-sm bg-muted text-foreground hover:bg-muted/80"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-500" />
                    {amenity}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Site Plan */}
          {project.sitePlan && (
            <>
              <Separator />
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Site Plan
                </h2>
                <Card>
                  <CardContent className="p-0 sm:p-6 overflow-hidden">
                    <ProjectSitePlan url={project.sitePlan} />
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {/* Location Map */}
          {project.location?.coordinates && (
            <>
              <Separator />
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  Location
                </h2>
                <Card className="overflow-hidden">
                  <CardContent className="p-0 h-[400px]">
                    <ProjectMap
                      coordinates={project.location.coordinates}
                      name={project.name}
                    />
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {/* Documents */}
          {project.approvalDocuments &&
            project.approvalDocuments.length > 0 && (
              <>
                <Separator />
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">Documents</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.approvalDocuments.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors">
                          <FileText className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1 truncate">
                          <p className="font-medium text-sm">
                            Approval Document {index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            View PDF
                          </p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </a>
                    ))}
                  </div>
                </section>
              </>
            )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
          {/* Status Card */}
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
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
              <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                <span className="text-sm text-muted-foreground">
                  Development
                </span>
                <span className="font-medium text-sm">
                  {project.developmentStatus.replace(/-/g, " ").toUpperCase()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors">
                <span className="text-sm text-muted-foreground">Legal</span>
                <span className="font-medium text-sm">
                  {project.legalStatus.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <Separator />
              <div className="flex flex-col p-2 rounded hover:bg-muted/50 transition-colors gap-1">
                <span className="text-sm text-muted-foreground">
                  RERA Number
                </span>
                <span className="font-mono text-sm font-medium">
                  {project.reraNumber}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Timelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 rounded bg-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Possession Date
                  </p>
                  <p className="font-semibold">
                    {format(new Date(project.possessionDate), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 rounded bg-muted-foreground/30" />
                <div>
                  <p className="text-xs text-muted-foreground">Created On</p>
                  <p className="font-semibold">
                    {format(new Date(project.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Booking Section */}
      <section id="booking-section" className="scroll-mt-24 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              Select Your Plot
            </h2>
            <p className="text-muted-foreground mt-2">
              Browse available plots and make a booking directly.
            </p>
          </div>

          {/* Plot Stats Summary */}
          {stats && (
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Badge
                variant="outline"
                className="px-3 py-1.5 border-green-200 bg-green-50 text-green-700"
              >
                Available: {stats.available}
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1.5 border-blue-200 bg-blue-50 text-blue-700"
              >
                Booked: {stats.booked}
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1.5 border-yellow-200 bg-yellow-50 text-yellow-700"
              >
                Reserved: {stats.reserved}
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1.5 border-red-200 bg-red-50 text-red-700"
              >
                Sold: {stats.sold}
              </Badge>
            </div>
          )}
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-6 border-b">
            <div className="w-full sm:w-auto">
              {blocks.length > 0 && (
                <Tabs
                  value={activeBlock}
                  onValueChange={setActiveBlock}
                  className="w-full"
                >
                  <TabsList className="w-full sm:w-auto h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:shadow-md rounded-full px-4 py-2"
                    >
                      All Blocks
                    </TabsTrigger>
                    {blocks.map((block) => (
                      <TabsTrigger
                        key={block.id}
                        value={block.id}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:shadow-md rounded-full px-4 py-2"
                      >
                        {block.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-muted/5 min-h-[400px]">
            {isLoadingPlots ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading plots...</p>
              </div>
            ) : filteredPlots && filteredPlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredPlots.map((plot) => {
                  const selected = isSelected(plot._id);
                  const isAvailable = plot.status === "available";

                  return (
                    <div
                      key={plot._id}
                      className={`
                        relative group p-4 border rounded-xl flex flex-col items-center gap-2 transition-all duration-200
                        ${isAvailable
                          ? selected
                            ? "bg-primary/5 border-primary shadow-md ring-1 ring-primary"
                            : "bg-card hover:border-primary hover:shadow-lg cursor-pointer"
                          : "bg-muted/50 opacity-70 grayscale-[0.5]"
                        }
                      `}
                      onClick={() => {
                        if (isAvailable) {
                          togglePlotSelection(plot);
                        }
                      }}
                    >
                      {isAvailable && (
                        <div className="absolute top-3 right-3 z-10">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => togglePlotSelection(plot)}
                            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                        </div>
                      )}

                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                        <MapPin
                          className={`h-6 w-6 ${selected ? "text-primary" : "text-muted-foreground"
                            }`}
                        />
                      </div>

                      <span className="font-bold text-xl">
                        {plot.plotNumber}
                      </span>

                      <div className="text-xs text-muted-foreground text-center space-y-0.5">
                        <div className="font-medium text-foreground">
                          {plot.area} {plot.areaUnit}
                        </div>
                        <div className="capitalize">{plot.facing} Facing</div>
                      </div>

                      <Badge
                        variant={isAvailable ? "outline" : "secondary"}
                        className={`mt-2 text-[10px] px-2 py-0.5 h-5 uppercase tracking-wider ${isAvailable
                          ? "border-green-500 text-green-600 bg-green-50"
                          : plot.status === "booked"
                            ? "bg-blue-100 text-blue-700"
                            : plot.status === "on_hold"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {plot.status.replace("_", " ")}
                      </Badge>

                      {isAvailable && (
                        <div className="text-sm font-bold mt-2 text-primary">
                          {formatCurrency(project.adminBookingTokenAmount)}
                        </div>
                      )}

                      {plot.status === "on_hold" && plot.holdExpiresAt && (
                        <div className="mt-2 w-full">
                          <CountdownTimer
                            expiresAt={plot.holdExpiresAt}
                            className="text-orange-600 justify-center font-bold text-xs"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg">No plots found</h3>
                <p>Try selecting a different block or category.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Floating Selection Bar */}
      {
        selectedPlots.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-foreground text-background rounded-full shadow-2xl p-4 pl-6 flex items-center justify-between border border-border/10">
              <div className="flex flex-col">
                <span className="font-bold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {selectedPlots.length}
                  </span>
                  Selected
                </span>
                <span className="text-xs text-muted-foreground/80">
                  Total:{" "}
                  {formatCurrency(
                    selectedPlots.reduce(
                      (sum) => sum + (project?.adminBookingTokenAmount || 0),
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-full hover:bg-background/20 text-background hover:text-background"
                  onClick={() => setSelectedPlots([])}
                  title="Clear selection"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="h-8 w-px bg-background/20" />
                <Button
                  size="sm"
                  className="rounded-full px-6 font-semibold shadow-lg hover:scale-105 transition-transform"
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
                    className="rounded-full px-6 text-foreground font-semibold hover:scale-105 transition-transform"
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
        )
      }

      {
        project && (
          <BookingDialog
            open={isBookingOpen}
            onOpenChange={setIsBookingOpen}
            plots={selectedPlots}
            projectId={id}
            onSuccess={() => setSelectedPlots([])}
            mode={bookingMode}
            project={project}
          />
        )
      }
    </PageShell>
  );
};

const ProjectPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ProjectPageContent />
    </Suspense>
  );
};

export default ProjectPage;
