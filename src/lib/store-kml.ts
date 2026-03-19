import { Store } from "@/types/store"

const DEFAULT_KML_URL =
  "https://www.google.com/maps/d/kml?mid=1gEpdbhTyIMNYDUCbOuFPqPevXZcIjZs"

function ensurePlainKmlUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const isGoogleMapsKml =
      parsed.hostname.includes("google.com") &&
      parsed.pathname.includes("/maps/d/kml")

    if (isGoogleMapsKml && !parsed.searchParams.has("forcekml")) {
      parsed.searchParams.set("forcekml", "1")
    }

    return parsed.toString()
  } catch {
    return url
  }
}

const KNOWN_STORE_TYPES = [
  "GameStop",
  "Kandy'z",
  "Game Store",
  "Kiosk",
  "Gaming Cafe",
  "Pressbyran",
  "7-Eleven",
  "Circle K",
  "Hemkop",
  "ICA",
  "Coop",
  "Willys",
  "Netto",
  "Lidl",
  "Ahlens",
  "Elgiganten",
  "Webhallen",
  "Inet",
  "Komplett",
] as const

const REGION_BY_CITY: Record<string, string> = {
  stockholm: "Stockholm",
  solna: "Stockholm",
  taby: "Stockholm",
  sodertalje: "Stockholm",
  malmo: "Skane",
  lund: "Skane",
  helsingborg: "Skane",
  goteborg: "Vastra Gotaland",
  boras: "Vastra Gotaland",
  jonkoping: "Jonkoping",
  uppsala: "Uppsala",
  orebro: "Orebro",
  vasteras: "Vastmanland",
  linkoping: "Ostergotland",
  norrkoping: "Ostergotland",
  gavle: "Gavleborg",
  umea: "Vasterbotten",
  lulea: "Norrbotten",
}

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function stripTags(input: string): string {
  return decodeEntities(input)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .trim()
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function inferStoreType(name: string): string {
  const normalizedName = normalizeText(name)
  const match = KNOWN_STORE_TYPES.find((candidate) =>
    normalizedName.includes(normalizeText(candidate)),
  )

  return match ?? "Butik"
}

function inferAddressParts(description: string): {
  address: string
  postalCode: string
  city: string
} {
  const clean = stripTags(description)
  const lines = clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const firstUsefulLine =
    lines.find(
      (line) => /\d/.test(line) && !line.toLowerCase().startsWith("http"),
    ) ||
    lines[0] ||
    "Okand adress"

  const postalCityLine =
    lines.find((line) => /\b\d{3}\s?\d{2}\b/.test(line)) || ""
  const postalMatch = postalCityLine.match(/\b\d{3}\s?\d{2}\b/)
  const postalCode = postalMatch ? postalMatch[0] : ""

  let city = "Okand ort"
  if (postalCityLine) {
    city = postalCityLine.replace(/\b\d{3}\s?\d{2}\b/, "").trim() || city
  } else {
    const cityFromComma = firstUsefulLine.split(",").pop()?.trim()
    if (cityFromComma) {
      city = cityFromComma
    }
  }

  return {
    address: firstUsefulLine,
    postalCode,
    city,
  }
}

function inferRegion(city: string): string {
  const normalizedCity = normalizeText(city)
  return REGION_BY_CITY[normalizedCity] ?? "Okand"
}

function extractTag(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i")
  const match = block.match(regex)
  return match?.[1]?.trim() ?? ""
}

function parsePlacemark(placemark: string, index: number): Store | null {
  const name = stripTags(extractTag(placemark, "name")) || `Butik ${index + 1}`
  const description = extractTag(placemark, "description")
  const coordinatesRaw = extractTag(placemark, "coordinates")

  if (!coordinatesRaw) {
    return null
  }

  const [longitudeStr, latitudeStr] = coordinatesRaw
    .trim()
    .split(",")
    .map((value) => value.trim())

  const latitude = Number(latitudeStr)
  const longitude = Number(longitudeStr)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  const addressParts = inferAddressParts(description)

  return {
    id: `kml-${index + 1}`,
    name,
    address: addressParts.address,
    city: addressParts.city,
    postalCode: addressParts.postalCode,
    region: inferRegion(addressParts.city),
    storeType: inferStoreType(name),
    latitude,
    longitude,
  }
}

function extractNetworkHref(kmlText: string): string | null {
  const networkLinkMatch = kmlText.match(/<NetworkLink[\s\S]*?<\/NetworkLink>/i)
  if (!networkLinkMatch) {
    return null
  }

  const href = extractTag(networkLinkMatch[0], "href")
  if (!href) {
    return null
  }

  return href.trim()
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "pxl-store-locator/1.0",
    },
    next: {
      revalidate: 0,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch KML (${response.status})`)
  }

  return response.text()
}

export async function fetchStoresFromKml(): Promise<Store[]> {
  const sourceUrl = ensurePlainKmlUrl(
    process.env.PXL_STORES_KML_URL || DEFAULT_KML_URL,
  )
  const initialKml = await fetchText(sourceUrl)

  let effectiveKml = initialKml
  const linkedKml = extractNetworkHref(initialKml)

  if (linkedKml && linkedKml !== sourceUrl) {
    effectiveKml = await fetchText(ensurePlainKmlUrl(linkedKml))
  }

  const placemarkMatches = [
    ...effectiveKml.matchAll(/<Placemark[\s\S]*?<\/Placemark>/gi),
  ]

  const parsed = placemarkMatches
    .map((match, index) => parsePlacemark(match[0], index))
    .filter((store): store is Store => Boolean(store))

  if (parsed.length === 0) {
    throw new Error("No stores could be parsed from KML")
  }

  return parsed
}
