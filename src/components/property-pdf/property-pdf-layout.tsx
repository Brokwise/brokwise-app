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
  /** Base64 data URL for the company logo (for watermark & header) */
  logoBase64?: string | null;
};

/* ── Tiny inline‑style helpers ─────────────────────────── */

const COLORS = {
  dark: "#111827",
  body: "#374151",
  muted: "#6b7280",
  light: "#9ca3af",
  border: "#e5e7eb",
  bg: "#f9fafb",
  white: "#ffffff",
  blue: "#2563eb",
  green: "#059669",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: COLORS.muted,
  marginBottom: 5,
};

const sectionBox: React.CSSProperties = {
  padding: "10px 12px",
  backgroundColor: COLORS.bg,
  borderRadius: 6,
  border: `1px solid ${COLORS.border}`,
};

const labelStyle: React.CSSProperties = {
  color: COLORS.muted,
  fontSize: 10,
};

const valueStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 10,
  color: COLORS.dark,
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 4,
  alignItems: "baseline",
  marginBottom: 3,
};

/* ─────────────────────────────────────────────────────── */

export const PropertyPdfLayout = React.forwardRef<
  HTMLDivElement,
  PropertyPdfLayoutProps
>(({ property, exportedOnLabel, imageMap, logoBase64 }, ref) => {
  const allImages = [
    ...(property.featuredMedia ? [property.featuredMedia] : []),
    ...(property.images ?? []),
  ];
  const pdfImageUrls = allImages.filter(
    (m) => !!m && !m.toLowerCase().endsWith(".mp4")
  );

  const getImageSrc = (url: string) => imageMap?.get(url) ?? url;

  const pdfCoverImage = pdfImageUrls[0]
    ? getImageSrc(pdfImageUrls[0])
    : null;
  const pdfThumbImages = pdfImageUrls.slice(1, 5);
  const hasThumbImages = pdfThumbImages.length > 0;

  // Truncate description to fit single page
  const hasImages = pdfImageUrls.length > 0;
  const maxDescLen = hasImages ? 280 : 450;
  const description = property.description || "";
  const truncatedDesc =
    description.length > maxDescLen
      ? description.substring(0, maxDescLen).trim() + "..."
      : description;

  // Limit amenities and localities
  const amenities = (property.amenities ?? []).slice(0, 8);
  const localities = (property.localities ?? []).slice(0, 6);

  const hasDocuments =
    (property.floorPlans?.length ?? 0) > 0 ||
    property.jamabandiUrl ||
    property.khasraPlanUrl;

  // Extra overview facts
  const extraFacts: { label: string; value: string }[] = [];
  if (property.bhk) extraFacts.push({ label: "BHK", value: `${property.bhk}` });
  if (property.facing)
    extraFacts.push({ label: "Facing", value: property.facing.replace(/_/g, " ") });
  if (property.floor) extraFacts.push({ label: "Floor", value: property.floor });
  if (property.plotType)
    extraFacts.push({ label: "Plot", value: property.plotType });

  const logoSrc = logoBase64 || "/logo.webp";

  return (
    <div
      ref={ref}
      data-property-pdf
      style={{
        width: 794,
        height: 1123,
        overflow: "hidden",
        position: "relative",
        fontFamily:
          "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        backgroundColor: COLORS.white,
        color: COLORS.dark,
      }}
    >
      {/* ── Watermark: single centered logo ──────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          style={{ width: 260, height: 260, opacity: 0.055 }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, padding: "24px 28px 20px" }}>
        {/* ── Header ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 10,
            borderBottom: `2px solid ${COLORS.dark}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Brokwise"
              style={{ width: 28, height: 28 }}
            />
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: COLORS.dark,
                  letterSpacing: -0.4,
                  lineHeight: 1,
                }}
              >
                Brokwise
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: COLORS.muted,
                  marginTop: 1,
                  letterSpacing: 0.3,
                }}
              >
                Property Details
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: COLORS.light }}>Exported on</div>
            <div
              style={{ fontSize: 10, fontWeight: 600, color: COLORS.body }}
            >
              {exportedOnLabel}
            </div>
          </div>
        </div>

        {/* ── Badges row ─────────────────────────────────── */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {property.propertyId && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 10px",
                backgroundColor: COLORS.dark,
                color: COLORS.white,
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 0.4,
                lineHeight: "14px",
              }}
            >
              ID: {property.propertyId}
            </div>
          )}
          {property.isVerified && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 10px",
                backgroundColor: COLORS.green,
                color: COLORS.white,
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 600,
                lineHeight: "14px",
              }}
            >
              Verified
            </div>
          )}
          {property.isFeatured && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 10px",
                backgroundColor: "#d97706",
                color: COLORS.white,
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 600,
                lineHeight: "14px",
              }}
            >
              Featured
            </div>
          )}
          {property.propertyTitle && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.body,
                marginLeft: 4,
                lineHeight: "14px",
              }}
            >
              {property.propertyTitle}
            </div>
          )}
        </div>

        {/* ── Photos ─────────────────────────────────────── */}
        {hasImages && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 5, height: 170 }}>
              {/* Hero image */}
              {pdfCoverImage && (
                <div
                  style={{
                    flex: hasThumbImages ? 3 : 1,
                    borderRadius: 6,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pdfCoverImage}
                    alt="Property"
                    crossOrigin="anonymous"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Thumbnail column 1 */}
              {pdfThumbImages.length >= 1 && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                  }}
                >
                  {pdfThumbImages.slice(0, 2).map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        borderRadius: 5,
                        overflow: "hidden",
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageSrc(url)}
                        alt={`Photo ${idx + 2}`}
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Thumbnail column 2 */}
              {pdfThumbImages.length >= 3 && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                  }}
                >
                  {pdfThumbImages.slice(2, 4).map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        borderRadius: 5,
                        overflow: "hidden",
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageSrc(url)}
                        alt={`Photo ${idx + 4}`}
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pdfImageUrls.length > 5 && (
              <div style={{ fontSize: 8, color: COLORS.light, marginTop: 3 }}>
                +{pdfImageUrls.length - 5} more photo
                {pdfImageUrls.length - 5 === 1 ? "" : "s"} not shown
              </div>
            )}
          </div>
        )}

        {/* ── Overview + Pricing ─────────────────────────── */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
          }}
        >
          {/* Overview */}
          <div style={{ ...sectionBox, flex: 1 }}>
            <div style={sectionTitle}>Overview</div>
            <div style={row}>
              <span style={labelStyle}>Category:</span>
              <span style={valueStyle}>{property.propertyCategory}</span>
            </div>
            <div style={row}>
              <span style={labelStyle}>Type:</span>
              <span style={valueStyle}>
                {property.propertyType?.replace(/_/g, " ")}
              </span>
            </div>
            <div style={row}>
              <span style={labelStyle}>Size:</span>
              <span style={valueStyle}>
                {property.size
                  ? `${property.size} ${(property.sizeUnit || "").replace(/_/g, " ")}`
                  : "N/A"}
              </span>
            </div>
            <div style={row}>
              <span style={labelStyle}>Status:</span>
              <span style={valueStyle}>
                {property.listingStatus?.replace(/_/g, " ")}
              </span>
            </div>
            {extraFacts.slice(0, 2).map((f) => (
              <div key={f.label} style={row}>
                <span style={labelStyle}>{f.label}:</span>
                <span style={valueStyle}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div style={{ ...sectionBox, flex: 1 }}>
            <div style={sectionTitle}>Pricing</div>
            <div style={{ ...row, marginBottom: 5 }}>
              <span style={labelStyle}>Total Price:</span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: COLORS.dark,
                }}
              >
                {formatCurrency(property.totalPrice)}
              </span>
            </div>
            <div style={row}>
              <span style={labelStyle}>Rate:</span>
              <span style={valueStyle}>
                {formatCurrency(property.rate)} /{" "}
                {property.sizeUnit?.toLowerCase().replace("_", " ") ?? "unit"}
              </span>
            </div>
            <div style={row}>
              <span style={labelStyle}>Negotiable:</span>
              <span style={valueStyle}>
                {property.isPriceNegotiable ? "Yes" : "No"}
              </span>
            </div>
            {property.rentalIncome && (
              <div style={row}>
                <span style={labelStyle}>Rental:</span>
                <span style={valueStyle}>
                  {formatCurrency(property.rentalIncome.min)} –{" "}
                  {formatCurrency(property.rentalIncome.max)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Address ────────────────────────────────────── */}
        <div style={{ ...sectionBox, marginTop: 10 }}>
          <div style={sectionTitle}>Address</div>
          <div
            style={{
              fontSize: 10,
              color: COLORS.body,
              lineHeight: 1.45,
            }}
          >
            {formatAddress(property.address)}
          </div>
        </div>

        {/* ── Description ────────────────────────────────── */}
        {truncatedDesc && (
          <div style={{ ...sectionBox, marginTop: 10 }}>
            <div style={sectionTitle}>Description</div>
            <div
              style={{
                fontSize: 10,
                color: COLORS.body,
                lineHeight: 1.5,
                maxHeight: 60,
                overflow: "hidden",
              }}
            >
              {truncatedDesc}
            </div>
          </div>
        )}

        {/* ── Amenities + Localities ─────────────────────── */}
        {(amenities.length > 0 || localities.length > 0) && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 8,
            }}
          >
            {amenities.length > 0 && (
              <div style={{ ...sectionBox, flex: 1 }}>
                <div style={sectionTitle}>Amenities</div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                >
                  {amenities.map((a, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        padding: "2px 7px",
                        backgroundColor: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 3,
                        fontSize: 9,
                        color: COLORS.body,
                      }}
                    >
                      {a}
                    </span>
                  ))}
                  {(property.amenities?.length ?? 0) > 8 && (
                    <span
                      style={{
                        fontSize: 9,
                        color: COLORS.light,
                        padding: "2px 4px",
                      }}
                    >
                      +{(property.amenities?.length ?? 0) - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {localities.length > 0 && (
              <div style={{ ...sectionBox, flex: 1 }}>
                <div style={sectionTitle}>Nearby Localities</div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                >
                  {localities.map((l, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        padding: "2px 7px",
                        backgroundColor: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 3,
                        fontSize: 9,
                        color: COLORS.body,
                      }}
                    >
                      {l}
                    </span>
                  ))}
                  {(property.localities?.length ?? 0) > 6 && (
                    <span
                      style={{
                        fontSize: 9,
                        color: COLORS.light,
                        padding: "2px 4px",
                      }}
                    >
                      +{(property.localities?.length ?? 0) - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Documents (clickable links) ────────────────── */}
        {hasDocuments && (
          <div style={{ ...sectionBox, marginTop: 10 }}>
            <div style={sectionTitle}>Documents &amp; Plans</div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                fontSize: 10,
              }}
            >
              {property.floorPlans?.map((plan, idx) => (
                <a
                  key={`fp-${idx}`}
                  href={plan}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLORS.blue,
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  Floor Plan {property.floorPlans!.length > 1 ? idx + 1 : ""}
                </a>
              ))}
              {property.jamabandiUrl && (
                <a
                  href={property.jamabandiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLORS.blue,
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  Jamabandi
                </a>
              )}
              {property.khasraPlanUrl && (
                <a
                  href={property.khasraPlanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLORS.blue,
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  Khasra Plan
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        <div
          style={{
            marginTop: 14,
            paddingTop: 8,
            borderTop: `1px solid ${COLORS.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 8, color: COLORS.light }}>
            Created:{" "}
            {property.createdAt
              ? format(new Date(property.createdAt), "PPP")
              : "N/A"}
            {"  ·  "}
            Updated:{" "}
            {property.updatedAt
              ? format(new Date(property.updatedAt), "PPP")
              : "N/A"}
          </div>
          <div
            style={{
              fontSize: 8,
              color: COLORS.light,
              letterSpacing: 0.3,
            }}
          >
            Generated by Brokwise · Confidential
          </div>
        </div>
      </div>
    </div>
  );
});
PropertyPdfLayout.displayName = "PropertyPdfLayout";
