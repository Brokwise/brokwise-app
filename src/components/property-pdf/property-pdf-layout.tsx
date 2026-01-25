"use client";

import * as React from "react";
import { format } from "date-fns";
import { formatAddress, formatCurrency } from "@/utils/helper";
import type { Property } from "@/types/property";

type PropertyPdfLayoutProps = {
  property: Property;
  exportedOnLabel: string;
  /** Map of original image URLs to base64 data URLs for PDF rendering */
  imageMap?: Map<string, string>;
};

export const PropertyPdfLayout = React.forwardRef<
  HTMLDivElement,
  PropertyPdfLayoutProps
>(({ property, exportedOnLabel, imageMap }, ref) => {
  const allImages = [
    ...(property.featuredMedia ? [property.featuredMedia] : []),
    ...(property.images ?? []),
  ];
  const pdfImageUrls = allImages.filter((m) => !!m && !m.toLowerCase().endsWith(".mp4"));

  // Use base64 URLs if available, otherwise fall back to original URLs
  const getImageSrc = (url: string) => imageMap?.get(url) ?? url;

  const pdfCoverImage = pdfImageUrls[0] ? getImageSrc(pdfImageUrls[0]) : "/images/placeholder.webp";
  const pdfThumbImages = pdfImageUrls.slice(1, 7);

  return (
    <div
      ref={ref}
      data-property-pdf
      className="relative p-10 bg-white text-black rounded-2xl border shadow-sm overflow-hidden"
    >
      {/* Top accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-neutral-900 via-neutral-500 to-transparent"
      />

      {/* Watermark layer (behind content) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-around"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="select-none text-[96px] font-semibold tracking-widest uppercase"
            style={{
              opacity: 0.06,
              transform: "rotate(-28deg)",
              color: "#000000",
            }}
          >
            Brokwise
          </div>
        ))}
      </div>

      {/* Content layer */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between gap-6 border-b pb-4">
          <div>
            <div className="text-2xl font-bold">Brokwise</div>
            <div className="text-sm text-neutral-600">Property Details</div>
          </div>
          <div className="text-right text-sm text-neutral-700">
            <div>
              <span className="font-semibold">Exported on:</span>{" "}
              {exportedOnLabel}
            </div>
          </div>
        </div>

        {/* Photos */}
        {pdfImageUrls.length > 0 ? (
          <div className="rounded-xl border p-4 break-inside-avoid">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Photos</div>
              <div className="text-xs text-neutral-600">
                {pdfImageUrls.length} image{pdfImageUrls.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 auto-rows-[120px]">
              {/* Hero */}
              <div className="col-span-2 row-span-2 rounded-xl overflow-hidden border bg-neutral-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pdfCoverImage}
                  alt="Property cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.webp";
                  }}
                />
              </div>

              {pdfThumbImages.slice(0, 4).map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="rounded-xl overflow-hidden border bg-neutral-100 relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageSrc(url)}
                    alt={`Property photo ${idx + 2}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.webp";
                    }}
                  />
                </div>
              ))}
            </div>

            {pdfThumbImages.length > 4 && (
              <div className="mt-3 text-xs text-neutral-600">
                + {pdfThumbImages.length - 4} more photo
                {pdfThumbImages.length - 4 === 1 ? "" : "s"} not shown
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border p-4 break-inside-avoid">
            <div className="text-sm font-semibold mb-1">Photos</div>
            <div className="text-sm text-neutral-700">No images available</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md border p-4">
            <div className="text-sm font-semibold mb-2">Overview</div>
            <div className="text-sm">
              <div>
                <span className="font-semibold">Category:</span>{" "}
                {property.propertyCategory}
              </div>
              <div>
                <span className="font-semibold">Type:</span>{" "}
                {property.propertyType?.replace(/_/g, " ")}
              </div>
              <div>
                <span className="font-semibold">Size:</span>{" "}
                {property.size ? `${property.size} ${property.sizeUnit || ""}` : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                {property.listingStatus?.replace(/_/g, " ")}
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="text-sm font-semibold mb-2">Pricing</div>
            <div className="text-sm">
              <div>
                <span className="font-semibold">Total Price:</span>{" "}
                {formatCurrency(property.totalPrice)}
              </div>
              <div>
                <span className="font-semibold">Rate:</span>{" "}
                {formatCurrency(property.rate)} /{" "}
                {property.sizeUnit?.toLowerCase().replace("_", " ")}
              </div>
              <div>
                <span className="font-semibold">Negotiable:</span>{" "}
                {property.isPriceNegotiable ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="text-sm font-semibold mb-2">Address</div>
          <div className="text-sm text-neutral-800">{formatAddress(property.address)}</div>
        </div>

        <div className="rounded-md border p-4">
          <div className="text-sm font-semibold mb-2">Description</div>
          <div className="text-sm whitespace-pre-wrap text-neutral-800">
            {property.description || "N/A"}
          </div>
        </div>

        {(property.amenities?.length || property.localities?.length) && (
          <div className="grid grid-cols-2 gap-4">
            {property.amenities?.length ? (
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Amenities</div>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {property.amenities.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Amenities</div>
                <div className="text-sm text-neutral-700">N/A</div>
              </div>
            )}

            {property.localities?.length ? (
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Nearby Localities</div>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {property.localities.map((l, idx) => (
                    <li key={idx}>{l}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Nearby Localities</div>
                <div className="text-sm text-neutral-700">N/A</div>
              </div>
            )}
          </div>
        )}

        {(property.floorPlans?.length ||
          property.jamabandiUrl ||
          property.khasraPlanUrl) && (
            <div className="rounded-md border p-4">
              <div className="text-sm font-semibold mb-2">Documents</div>
              <div className="text-sm space-y-2">
                {property.floorPlans?.map((plan, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-semibold whitespace-nowrap">Floor Plan {idx + 1}:</span>
                    <a
                      href={plan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline truncate hover:text-blue-800"
                    >
                      View Floor Plan
                    </a>
                  </div>
                ))}
                {property.jamabandiUrl && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold whitespace-nowrap">Jamabandi:</span>
                    <a
                      href={property.jamabandiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline truncate hover:text-blue-800"
                    >
                      View Jamabandi
                    </a>
                  </div>
                )}
                {property.khasraPlanUrl && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold whitespace-nowrap">Khasra Plan:</span>
                    <a
                      href={property.khasraPlanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline truncate hover:text-blue-800"
                    >
                      View Khasra Plan
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        <div className="flex items-center justify-between text-xs text-neutral-600 border-t pt-4">
          <div>
            Created:{" "}
            {property.createdAt ? format(new Date(property.createdAt), "PPP") : "N/A"}
          </div>
          <div>
            Last Updated:{" "}
            {property.updatedAt ? format(new Date(property.updatedAt), "PPP") : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
});
PropertyPdfLayout.displayName = "PropertyPdfLayout";


