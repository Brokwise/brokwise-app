"use client";

import * as React from "react";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { Property } from "@/types/property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MediaCarouselProps {
    images: string[];
    property: Property;
}

export const MediaCarousel = ({ images, property }: MediaCarouselProps) => {
    const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
    const [activeImageIndex, setActiveImageIndex] = React.useState(0);

    const imageGallery = images.filter((media) => !media.endsWith(".mp4"));

    const handleOpenGallery = (imageUrl: string) => {
        if (imageGallery.length === 0) return;
        const index = imageGallery.indexOf(imageUrl);
        setActiveImageIndex(index >= 0 ? index : 0);
        setIsGalleryOpen(true);
    };

    return (
        <>
            <div className="rounded-xl overflow-hidden bg-muted aspect-video relative border group">
                {images.length > 0 ? (
                    <Carousel className="w-full h-full">
                        <CarouselContent className="h-full -ml-0">
                            {images.map((image, index) => (
                                <CarouselItem key={index} className="h-full pl-0 basis-full">
                                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                                        {image.endsWith(".mp4") ? (
                                            <video
                                                src={image}
                                                controls
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenGallery(image)}
                                                className="w-full h-full cursor-zoom-in relative"
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`Property Image ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 70vw"
                                                    className="object-cover"
                                                    priority={index === 0}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/images/placeholder.webp";
                                                    }}
                                                />
                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                            </button>
                                        )}
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {/* Overlay Chips - Only show on first slide conceptually, but for now we show always */}
                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none z-10">
                            {property.facing && (
                                <Badge variant="secondary" className="bg-background/80 hover:bg-background/90 backdrop-blur text-foreground">
                                    {property.facing} Facing
                                </Badge>
                            )}
                            {property.plotType && (
                                <Badge variant="secondary" className="bg-background/80 hover:bg-background/90 backdrop-blur text-foreground">
                                    {property.plotType}
                                </Badge>
                            )}
                            {property.frontRoadWidth && (
                                <Badge variant="secondary" className="bg-background/80 hover:bg-background/90 backdrop-blur text-foreground">
                                    {property.frontRoadWidth} {property.roadWidthUnit?.toLowerCase() || "ft"} Road
                                </Badge>
                            )}
                        </div>

                        {images.length > 1 && (
                            <>
                                <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={() => handleOpenGallery(images[0])}
                        >
                            <Maximize2 className="h-4 w-4" />
                            View Photos
                        </Button>
                    </Carousel>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No images available
                    </div>
                )}
            </div>

            {imageGallery.length > 0 && (
                <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                    <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black border-none">
                        <div className="flex h-full flex-col relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                                onClick={() => setIsGalleryOpen(false)}
                            >
                                <ArrowLeft className="h-6 w-6 rotate-180" /> {/* Using rotate just to have an X icon or similar close feeling if x not avail */}
                                {/* Actually, let's just properly use the dialog close or custom close */}
                            </Button>

                            <div className="relative h-[85%] w-full bg-black flex items-center justify-center">
                                {imageGallery[activeImageIndex] ? (
                                    <Image
                                        src={imageGallery[activeImageIndex]}
                                        alt={`Property ${activeImageIndex + 1}`}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                ) : null}

                                {imageGallery.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImageIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length)}
                                            className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur transition"
                                        >
                                            <ArrowLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={() => setActiveImageIndex((prev) => (prev + 1) % imageGallery.length)}
                                            className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur transition"
                                        >
                                            <ArrowLeft className="h-6 w-6 rotate-180" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="h-[15%] w-full bg-black/90 p-4 border-t border-white/10">
                                <div className="flex h-full items-center gap-2 overflow-x-auto justify-center">
                                    {imageGallery.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`relative h-16 w- aspect-video shrink-0 overflow-hidden rounded-md transition-all ${index === activeImageIndex ? "ring-2 ring-primary opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <Image src={image} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
