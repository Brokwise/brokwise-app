import { NextRequest, NextResponse } from "next/server";

// See https://developers.google.com/maps/documentation/places/web-service/op-overview
// The new Places API (New) uses POST requests to https://places.googleapis.com/v1/places:autocomplete

type GooglePlacePredictionNew = {
  placePrediction: {
    place: string; // "places/PLACE_ID"
    placeId: string;
    text: {
      text: string;
      matches: { endOffset: number }[];
    };
    structuredFormat: {
      mainText: { text: string; matches: { endOffset: number }[] };
      secondaryText: { text: string };
    };
    types: string[];
  };
};

type AddressSuggestion = {
  id: string;
  place_name: string;
  center?: [number, number];
  context?: { id: string; text: string }[];
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return NextResponse.json({ features: [] });
  }

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Google Maps API key", features: [] },
      { status: 500 }
    );
  }

  // Google Places API (New) Autocomplete
  const url = "https://places.googleapis.com/v1/places:autocomplete";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: q,
        includedRegionCodes: ["IN"], // Restrict to India
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Google Places API (New) failed:", res.status, errorData);
      return NextResponse.json(
        { error: "Google Places API failed", features: [] },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      suggestions?: GooglePlacePredictionNew[];
    };

    const suggestions = data.suggestions ?? [];

    // Map to the format expected by the frontend (AddressSuggestion)
    const features: AddressSuggestion[] = suggestions.map((item) => {
      const pred = item.placePrediction;

      // Parse context from structuredFormat if available
      // The new API structure is different. We can try to split the secondary text or just use the whole description.
      // place_name usually needs to be the full address for the input value.
      const placeName = pred.text.text;

      // Construct a simple context array similar to before.
      // The new API doesn't give "terms" like the old one, but structuredFormat has main/secondary.
      // We can construct a mock context from the comma-separated parts of the full text.
      const parts = placeName.split(",").map((p) => p.trim());
      const context = parts.map((part, index) => ({
        id: `part.${index}`,
        text: part,
      }));

      return {
        id: pred.placeId,
        place_name: placeName,
        context: context,
      };
    });

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Failed to reach Google Places API (New):", error);
    return NextResponse.json(
      { error: "Failed to reach Google Places API", features: [] },
      { status: 502 }
    );
  }
}
