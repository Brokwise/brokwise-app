import { NextRequest, NextResponse } from "next/server";

type MapboxFeature = {
  id: string;
  place_name: string;
  center: [number, number];
  context?: { id: string; text: string }[];
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "5") || 5;

  if (q.length < 3) {
    return NextResponse.json({ features: [] satisfies MapboxFeature[] });
  }

  const token =
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    "";

  if (!token) {
    return NextResponse.json(
      { error: "Missing Mapbox access token", features: [] },
      { status: 500 }
    );
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    q
  )}.json?access_token=${encodeURIComponent(token)}&limit=${encodeURIComponent(
    String(Math.min(Math.max(limit, 1), 10))
  )}&country=IN&types=address,postcode,place,locality`;

  try {
    const res = await fetch(url, {
      // Avoid caching stale suggestions
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Mapbox geocoding failed", features: [] },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { features?: MapboxFeature[] };
    return NextResponse.json({ features: data.features ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Mapbox geocoding", features: [] },
      { status: 502 }
    );
  }
}
