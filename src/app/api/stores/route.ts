import { NextResponse } from "next/server"
import { fetchStoresFromKml } from "@/lib/store-kml"

export const revalidate = 1800

export async function GET() {
  try {
    const stores = await fetchStoresFromKml()

    return NextResponse.json(
      {
        stores,
        source: "kml",
      },
      {
        status: 200,
      },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown KML fetch error"

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 502,
      },
    )
  }
}
