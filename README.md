# PXL Store Locator

Store locator for PXL Energy built with Next.js. The app fetches stores from a Google My Maps KML source, renders them in a searchable/filterable list, and shows selected stores on a Google Map.

## What This Project Does

- Fetches store data from a KML endpoint (`/api/stores`)
- Supports search, region/store-type filters, and sort by distance
- Integrates geolocation for "nearest store" behavior
- Shows selected store details in a custom map overlay
- Supports dark/light mode (system by default + manual toggle)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript 5
- Tailwind CSS 4
- shadcn/ui + Radix UI primitives
- Google Maps JavaScript API

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: override default Google My Maps KML source
PXL_STORES_KML_URL=https://www.google.com/maps/d/kml?mid=YOUR_MAP_ID
```

## Data Source and Sync Behavior

The API route `src/app/api/stores/route.ts` calls `fetchStoresFromKml()` from `src/lib/store-kml.ts`.

- Default KML source:
  - `https://www.google.com/maps/d/kml?mid=1gEpdbhTyIMNYDUCbOuFPqPevXZcIjZs`
- Revalidation/cache interval:
  <!-- - `1800` seconds (30 minutes) -->
  - `0` seconds (0 minutes)

This means updates in Google My Maps are reflected here after cache revalidation, not always instantly.

If KML fetch/parsing fails, the API responds with an error (`502`) and no static fallback dataset.

## Scripts

```bash
npm run dev          # Start dev server on :3000
npm run build        # Build Next.js + prepare standalone output
npm run start        # Run standalone production server
npm run lint         # Run ESLint
```

## Project Structure

```text
src/
	app/
		page.tsx                    # Main locator UI and state
		api/stores/route.ts         # Store API (KML only)
	components/store-locator/     # Locator UI components
	lib/store-kml.ts              # KML fetch + parse logic
	types/store.ts                # Store/filter/location types
```

## Notes

- The map requires a valid Google Maps API key and proper referrer restrictions.
- Current marker implementation uses `google.maps.Marker` (deprecated by Google but still functional).
- README is intentionally scoped to this project, not the original scaffold template.
