import { NextRequest, NextResponse } from "next/server";

type GooglePlacePredictionNew = {
  placePrediction: {
    place: string;
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

    const features: AddressSuggestion[] = suggestions.map((item) => {
      const pred = item.placePrediction;
      const placeName = pred.text.text;
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
