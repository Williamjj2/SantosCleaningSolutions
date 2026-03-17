export interface CityNeighborhood {
  name: string;
}

export interface CityPageData {
  slug: string;
  city: string;
  state: string;
  region: string;
  zip: string;
  lat: string;
  lng: string;
  neighborhoods: CityNeighborhood[];
  description: string;
  luxuryNote: string;
}

export const cityPages: CityPageData[] = [
  {
    slug: "alpharetta-house-cleaning",
    city: "Alpharetta",
    state: "GA",
    region: "North Fulton",
    zip: "30009",
    lat: "34.0754",
    lng: "-84.2941",
    neighborhoods: [
      { name: "Downtown Alpharetta" },
      { name: "Avalon" },
      { name: "Windward" },
      { name: "Crabapple" },
      { name: "Northpoint" },
      { name: "Old Milton" },
      { name: "Wills Park" },
      { name: "Webb Bridge" },
      { name: "Encore" },
      { name: "Brookside" },
    ],
    description:
      "Trusted by Alpharetta's finest families. Licensed, insured, and 5-star rated. Deep cleaning, regular maid service, and move-out cleaning with same-day availability.",
    luxuryNote:
      "Specialized service for Alpharetta's luxury homes and estates. White-glove service with attention to fine finishes, marble, and high-end materials.",
  },
  {
    slug: "buckhead-house-cleaning",
    city: "Buckhead",
    state: "GA",
    region: "Atlanta",
    zip: "30305",
    lat: "33.8384",
    lng: "-84.3793",
    neighborhoods: [
      { name: "Tuxedo Park" },
      { name: "Chastain Park" },
      { name: "Peachtree Hills" },
      { name: "Garden Hills" },
      { name: "Paces" },
      { name: "West Paces Ferry" },
      { name: "Lenox" },
      { name: "Phipps Plaza" },
    ],
    description:
      "Premium house cleaning for Buckhead's finest residences. Our experienced team delivers meticulous cleaning tailored to luxury homes and condos.",
    luxuryNote:
      "Buckhead's luxury homes deserve white-glove cleaning. We handle marble floors, high-end fixtures, and fine finishes with expert care.",
  },
  {
    slug: "sandy-springs-house-cleaning",
    city: "Sandy Springs",
    state: "GA",
    region: "North Atlanta",
    zip: "30328",
    lat: "33.9304",
    lng: "-84.3733",
    neighborhoods: [
      { name: "Riverside" },
      { name: "Powers Ferry" },
      { name: "Heards Ferry" },
      { name: "Mount Vernon" },
      { name: "Dunwoody Place" },
      { name: "Lake Forrest" },
      { name: "Sandy Springs Circle" },
      { name: "Spalding Drive" },
    ],
    description:
      "Reliable house cleaning for Sandy Springs families. Same trusted team every visit, eco-friendly products, and 100% satisfaction guaranteed.",
    luxuryNote:
      "From riverfront estates to modern condos, our Sandy Springs cleaning team handles every property type with care.",
  },
  {
    slug: "roswell-house-cleaning",
    city: "Roswell",
    state: "GA",
    region: "North Fulton",
    zip: "30075",
    lat: "34.0232",
    lng: "-84.3616",
    neighborhoods: [
      { name: "Historic Roswell" },
      { name: "Crabapple" },
      { name: "Martin's Landing" },
      { name: "Riverview" },
      { name: "Horseshoe Bend" },
      { name: "Willeo" },
      { name: "Mountain Park" },
      { name: "Holcomb Bridge" },
    ],
    description:
      "Professional house cleaning in Roswell, GA. From historic homes to modern estates, we deliver thorough cleaning with attention to every detail.",
    luxuryNote:
      "Roswell's charming historic homes and modern estates both receive our signature attention to detail and premium care.",
  },
  {
    slug: "dunwoody-house-cleaning",
    city: "Dunwoody",
    state: "GA",
    region: "DeKalb County",
    zip: "30338",
    lat: "33.9462",
    lng: "-84.3346",
    neighborhoods: [
      { name: "Georgetown" },
      { name: "Dunwoody Village" },
      { name: "Perimeter" },
      { name: "Winters Chapel" },
      { name: "Tilly Mill" },
      { name: "Kingsley" },
      { name: "Brook Run" },
      { name: "Vermack" },
    ],
    description:
      "Expert house cleaning in Dunwoody. Serving families near Perimeter, Georgetown, and all Dunwoody neighborhoods with consistent, high-quality service.",
    luxuryNote:
      "From Perimeter condos to Georgetown estates, Dunwoody residents trust our team for reliable, thorough cleaning.",
  },
  {
    slug: "johns-creek-house-cleaning",
    city: "Johns Creek",
    state: "GA",
    region: "North Fulton",
    zip: "30097",
    lat: "34.0289",
    lng: "-84.1986",
    neighborhoods: [
      { name: "Ocee" },
      { name: "Medlock Bridge" },
      { name: "Shakerag" },
      { name: "Abbotts Bridge" },
      { name: "Newtown" },
      { name: "Country Club of the South" },
      { name: "St. Ives" },
      { name: "Rivermont" },
    ],
    description:
      "Trusted house cleaning in Johns Creek. Our professional team serves all Johns Creek communities with reliable, eco-friendly cleaning services.",
    luxuryNote:
      "Johns Creek's prestigious communities like Country Club of the South and St. Ives receive our premium white-glove cleaning service.",
  },
  {
    slug: "brookhaven-house-cleaning",
    city: "Brookhaven",
    state: "GA",
    region: "DeKalb County",
    zip: "30319",
    lat: "33.8651",
    lng: "-84.3365",
    neighborhoods: [
      { name: "Ashford Park" },
      { name: "Drew Valley" },
      { name: "Lynwood Park" },
      { name: "Brookhaven Fields" },
      { name: "Historic Brookhaven" },
      { name: "Town Brookhaven" },
      { name: "Peachtree Creek" },
      { name: "Oglethorpe" },
    ],
    description:
      "Professional house cleaning for Brookhaven homes. From Historic Brookhaven to Ashford Park, we keep your home spotless and welcoming.",
    luxuryNote:
      "Brookhaven's beautiful homes deserve meticulous care. Our team handles every property type with attention to detail.",
  },
  {
    slug: "marietta-house-cleaning",
    city: "Marietta",
    state: "GA",
    region: "Cobb County",
    zip: "30060",
    lat: "33.9526",
    lng: "-84.5499",
    neighborhoods: [
      { name: "Marietta Square" },
      { name: "East Cobb" },
      { name: "West Cobb" },
      { name: "Roswell Road" },
      { name: "Powers Ferry" },
      { name: "Sandy Plains" },
      { name: "Shallowford" },
      { name: "Johnson Ferry" },
    ],
    description:
      "Top-rated house cleaning in Marietta and Cobb County. Serving East Cobb, West Cobb, and all Marietta neighborhoods.",
    luxuryNote:
      "From East Cobb estates to downtown Marietta homes, our team delivers consistent, high-quality cleaning every visit.",
  },
  {
    slug: "milton-house-cleaning",
    city: "Milton",
    state: "GA",
    region: "North Fulton",
    zip: "30004",
    lat: "34.1348",
    lng: "-84.3002",
    neighborhoods: [
      { name: "Crabapple" },
      { name: "Birmingham" },
      { name: "Deerfield" },
      { name: "Cogburn Road" },
      { name: "Bethany Bend" },
      { name: "Providence" },
      { name: "The Manor" },
      { name: "White Columns" },
    ],
    description:
      "Premium house cleaning in Milton, GA. Serving Milton's equestrian estates, luxury communities, and family homes.",
    luxuryNote:
      "Milton's expansive properties and luxury estates receive our most comprehensive cleaning packages with white-glove service.",
  },
  {
    slug: "vinings-house-cleaning",
    city: "Vinings",
    state: "GA",
    region: "Cobb County",
    zip: "30339",
    lat: "33.8629",
    lng: "-84.4686",
    neighborhoods: [
      { name: "Paces Mill" },
      { name: "Overlook" },
      { name: "Vinings Jubilee" },
      { name: "The Terraces" },
      { name: "Vinings Estate" },
      { name: "Cumberland" },
    ],
    description:
      "Trusted cleaning services in Vinings. Professional maid service for Vinings homes, condos, and townhomes.",
    luxuryNote:
      "Vinings' upscale communities and elegant homes receive our premium cleaning with attention to luxury finishes.",
  },
  {
    slug: "decatur-house-cleaning",
    city: "Decatur",
    state: "GA",
    region: "DeKalb County",
    zip: "30030",
    lat: "33.7748",
    lng: "-84.2963",
    neighborhoods: [
      { name: "Downtown Decatur" },
      { name: "Oakhurst" },
      { name: "Winnona Park" },
      { name: "Glennwood Estates" },
      { name: "Great Lakes" },
      { name: "MAK" },
      { name: "Lenox Place" },
      { name: "Midway Woods" },
    ],
    description:
      "Professional house cleaning in Decatur. Eco-friendly products, thorough service, and the same trusted team every visit.",
    luxuryNote:
      "From Oakhurst bungalows to Decatur estates, we adapt our cleaning approach to match your home's unique character.",
  },
  {
    slug: "suwanee-house-cleaning",
    city: "Suwanee",
    state: "GA",
    region: "Gwinnett County",
    zip: "30024",
    lat: "34.0515",
    lng: "-84.0713",
    neighborhoods: [
      { name: "Suwanee Town Center" },
      { name: "Shadowbrook" },
      { name: "River Club" },
      { name: "Olde Atlanta" },
      { name: "Settles Bridge" },
      { name: "McGinnis Ferry" },
      { name: "Peachtree Industrial" },
      { name: "George Pierce Park" },
    ],
    description:
      "Reliable house cleaning in Suwanee, GA. Serving all Suwanee communities with professional, eco-friendly cleaning services.",
    luxuryNote:
      "Suwanee's growing community of luxury homes receives our dedicated cleaning service with consistent quality.",
  },
];

export function getCityPage(slug: string): CityPageData | undefined {
  return cityPages.find((c) => c.slug === slug);
}

export const otherCities = (currentSlug: string) =>
  cityPages.filter((c) => c.slug !== currentSlug);
