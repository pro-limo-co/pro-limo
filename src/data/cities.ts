export type City = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  lat: number;
  lng: number;
  airports: { code: string; name: string }[];
  neighborhoods: string[];
  popularRoutes: string[];
  tagline: string;
  intro: string;
  timezone: string;
};

export const cities: City[] = [
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    lat: 51.5074,
    lng: -0.1278,
    airports: [
      { code: "LHR", name: "Heathrow" },
      { code: "LGW", name: "Gatwick" },
      { code: "LCY", name: "City" },
      { code: "STN", name: "Stansted" },
    ],
    neighborhoods: ["Mayfair", "Belgravia", "Chelsea", "The City", "Knightsbridge", "Marylebone"],
    popularRoutes: ["London → Paris", "London → Oxford", "London → Cambridge", "London → Bath"],
    tagline: "Black cabs raised the standard. We raise it again.",
    intro:
      "From a hush in Mayfair to the runway at Heathrow, Pro Limo’s London chauffeurs know every back-road through the West End, every shortcut around Knightsbridge, and every quiet way to slip through Hyde Park traffic.",
    timezone: "Europe/London",
  },
  {
    slug: "new-york",
    name: "New York",
    country: "United States",
    countryCode: "US",
    region: "North America",
    lat: 40.7128,
    lng: -74.006,
    airports: [
      { code: "JFK", name: "John F. Kennedy" },
      { code: "LGA", name: "LaGuardia" },
      { code: "EWR", name: "Newark" },
      { code: "TEB", name: "Teterboro" },
    ],
    neighborhoods: ["Midtown", "Upper East Side", "Tribeca", "SoHo", "West Village", "Hudson Yards"],
    popularRoutes: ["JFK → Manhattan", "Manhattan → The Hamptons", "Manhattan → Greenwich", "Manhattan → Princeton"],
    tagline: "Five boroughs, one quiet ride.",
    intro:
      "Pro Limo’s New York fleet runs the avenues like a metronome — from a tarmac welcome at JFK to a dawn departure for the Hamptons. Cars are kept inside the city, not staged out of New Jersey.",
    timezone: "America/New_York",
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Europe",
    lat: 48.8566,
    lng: 2.3522,
    airports: [
      { code: "CDG", name: "Charles de Gaulle" },
      { code: "ORY", name: "Orly" },
      { code: "LBG", name: "Le Bourget" },
    ],
    neighborhoods: ["1er", "Le Marais", "Saint-Germain", "8ᵉ Triangle d’Or", "Trocadéro"],
    popularRoutes: ["CDG → 1er", "Paris → Versailles", "Paris → Reims", "Paris → Deauville"],
    tagline: "Une ville pour flâner. Une voiture pour le reste.",
    intro:
      "Our Paris chauffeurs read the city’s arrondissements the way sommeliers read a list — by character. Discreet flagship sedans glide between the Triangle d’Or and Saint-Germain without ever making a scene.",
    timezone: "Europe/Paris",
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "Asia Pacific",
    lat: 35.6762,
    lng: 139.6503,
    airports: [
      { code: "HND", name: "Haneda" },
      { code: "NRT", name: "Narita" },
    ],
    neighborhoods: ["Ginza", "Marunouchi", "Roppongi", "Aoyama", "Akasaka", "Shinjuku"],
    popularRoutes: ["Haneda → Ginza", "Tokyo → Hakone", "Tokyo → Karuizawa", "Tokyo → Yokohama"],
    tagline: "An exact second, for an exact city.",
    intro:
      "Tokyo respects time the way it respects a tea ceremony. So do we — Pro Limo chauffeurs in Tokyo arrive five minutes early, every time, in pristine private flagships kept whisper-quiet for the long ride to Hakone.",
    timezone: "Asia/Tokyo",
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Middle East",
    lat: 25.2048,
    lng: 55.2708,
    airports: [
      { code: "DXB", name: "Dubai International" },
      { code: "DWC", name: "Al Maktoum" },
    ],
    neighborhoods: ["DIFC", "Downtown", "Palm Jumeirah", "Dubai Marina", "Business Bay"],
    popularRoutes: ["DXB → DIFC", "Dubai → Abu Dhabi", "Dubai → Sharjah", "Dubai → Al Ain"],
    tagline: "A city built fast. We move you slowly.",
    intro:
      "Our Dubai fleet leans into the new — long-wheelbase EQS, BMW i7, and a Sprinter program for the family ride to Abu Dhabi. Every cabin is climate-prepped before you arrive, with chilled water set to 7°C.",
    timezone: "Asia/Dubai",
  },
  {
    slug: "zurich",
    name: "Zürich",
    country: "Switzerland",
    countryCode: "CH",
    region: "Europe",
    lat: 47.3769,
    lng: 8.5417,
    airports: [{ code: "ZRH", name: "Zürich Flughafen" }],
    neighborhoods: ["Bahnhofstrasse", "Enge", "Seefeld", "Hottingen", "Altstadt"],
    popularRoutes: ["Zürich → Davos", "Zürich → Geneva", "Zürich → St. Moritz", "Zürich → Lucerne"],
    tagline: "Punctuality you could set a clock by.",
    intro:
      "Zürich moves on a Swiss schedule. Pro Limo’s long-wheelbase fleet is staged in the city itself — not at the airport — so a chauffeur can be at your door in under twenty minutes, every minute of the day.",
    timezone: "Europe/Zurich",
  },
  {
    slug: "geneva",
    name: "Geneva",
    country: "Switzerland",
    countryCode: "CH",
    region: "Europe",
    lat: 46.2044,
    lng: 6.1432,
    airports: [{ code: "GVA", name: "Cointrin" }],
    neighborhoods: ["Eaux-Vives", "Champel", "Pâquis", "Vieille-Ville"],
    popularRoutes: ["Geneva → Davos", "Geneva → Zermatt", "Geneva → Lausanne", "Geneva → Lyon"],
    tagline: "Lakeside discretion, alpine reach.",
    intro:
      "Pro Limo Geneva runs cross-border routes into Annecy and Chamonix on a single fare, and stages winter S-class fleets with all-season packages for the run up to Davos.",
    timezone: "Europe/Zurich",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    country: "United States",
    countryCode: "US",
    region: "North America",
    lat: 34.0522,
    lng: -118.2437,
    airports: [
      { code: "LAX", name: "Los Angeles International" },
      { code: "BUR", name: "Hollywood Burbank" },
      { code: "VNY", name: "Van Nuys" },
    ],
    neighborhoods: ["Beverly Hills", "Bel Air", "Santa Monica", "Hollywood Hills", "Pacific Palisades"],
    popularRoutes: ["LAX → Beverly Hills", "LA → Malibu", "LA → Palm Springs", "LA → Santa Barbara"],
    tagline: "From the tarmac to the canyon, no traffic enters the cabin.",
    intro:
      "Our Los Angeles chauffeurs know which exits to skip on the 405 at 17:00, when to avoid the canyons, and how to get a Sprinter into Malibu without scraping a rim. Every cabin runs cool from the moment you sit down.",
    timezone: "America/Los_Angeles",
  },
  {
    slug: "milan",
    name: "Milan",
    country: "Italy",
    countryCode: "IT",
    region: "Europe",
    lat: 45.4642,
    lng: 9.19,
    airports: [
      { code: "MXP", name: "Malpensa" },
      { code: "LIN", name: "Linate" },
      { code: "BGY", name: "Bergamo" },
    ],
    neighborhoods: ["Quadrilatero", "Brera", "Porta Nuova", "Citylife"],
    popularRoutes: ["Milan → Lake Como", "Milan → Portofino", "Milan → St. Moritz", "Milan → Florence"],
    tagline: "Italian tailoring, four wheels.",
    intro:
      "Pro Limo Milan runs week-of-fashion logistics for every season — flagship sedans at Malpensa, Sprinters for the Como circuit, and a private concierge desk for the houses themselves.",
    timezone: "Europe/Rome",
  },
  {
    slug: "singapore",
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "Asia Pacific",
    lat: 1.3521,
    lng: 103.8198,
    airports: [{ code: "SIN", name: "Changi" }],
    neighborhoods: ["Marina Bay", "Orchard", "Tanglin", "Sentosa", "Raffles Place"],
    popularRoutes: ["Changi → Marina Bay", "Singapore → Johor Bahru", "Singapore → Sentosa Cove"],
    tagline: "Equatorial calm, climate-controlled.",
    intro:
      "Singapore’s Pro Limo fleet is the youngest in our network — flagship EQS and i7 hybrids, refreshed quarterly, kept to a one-degree cabin temperature standard at all times.",
    timezone: "Asia/Singapore",
  },
  {
    slug: "hong-kong",
    name: "Hong Kong",
    country: "Hong Kong SAR",
    countryCode: "HK",
    region: "Asia Pacific",
    lat: 22.3193,
    lng: 114.1694,
    airports: [{ code: "HKG", name: "Chek Lap Kok" }],
    neighborhoods: ["Central", "Mid-Levels", "The Peak", "Tsim Sha Tsui", "Repulse Bay"],
    popularRoutes: ["HKG → Central", "Hong Kong → Macau", "Hong Kong → Shenzhen"],
    tagline: "A vertical city, made level.",
    intro:
      "Pro Limo Hong Kong runs the Mid-Levels and Central with chauffeurs who could navigate Pottinger Street with their eyes shut — and a steady hand on the climb to The Peak when fog draws in.",
    timezone: "Asia/Hong_Kong",
  },
  {
    slug: "frankfurt",
    name: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    lat: 50.1109,
    lng: 8.6821,
    airports: [{ code: "FRA", name: "Flughafen Frankfurt" }],
    neighborhoods: ["Westend", "Sachsenhausen", "Bankenviertel", "Nordend"],
    popularRoutes: ["Frankfurt → Wiesbaden", "Frankfurt → Heidelberg", "Frankfurt → Stuttgart"],
    tagline: "The financial route, quietly run.",
    intro:
      "Frankfurt is Pro Limo’s European corporate hub — overnight roadshow logistics, pre-IPO travel desks, and a Bankenviertel-only fleet of long-wheelbase E and S-class.",
    timezone: "Europe/Berlin",
  },
];

export const featuredCitySlugs = [
  "london",
  "new-york",
  "paris",
  "tokyo",
  "dubai",
  "zurich",
];

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
