interface SchemaMarkupProps {
  type: "home" | "service" | "city" | "blog" | "article" | "faq" | "guide";
  data?: Record<string, unknown>;
}

const businessSchema = {
  "@type": "LocalBusiness",
  "@id": "https://santoscsolutions.com/#business",
  name: "Santos Cleaning Solutions",
  image: "https://santoscsolutions.com/images/santos-logo.png",
  url: "https://santoscsolutions.com",
  telephone: "+18663509407",
  email: "contact@santoscsolutions.com",
  priceRange: "$129-$599",
  address: {
    "@type": "PostalAddress",
    streetAddress: "595 Harcourt Pl SE",
    addressLocality: "Marietta",
    addressRegion: "GA",
    postalCode: "30067",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "33.9526",
    longitude: "-84.5499",
  },
  areaServed: [
    { "@type": "City", name: "Atlanta" },
    { "@type": "City", name: "Alpharetta" },
    { "@type": "City", name: "Buckhead" },
    { "@type": "City", name: "Sandy Springs" },
    { "@type": "City", name: "Roswell" },
    { "@type": "City", name: "Dunwoody" },
    { "@type": "City", name: "Johns Creek" },
    { "@type": "City", name: "Brookhaven" },
    { "@type": "City", name: "Marietta" },
    { "@type": "City", name: "Milton" },
    { "@type": "City", name: "Vinings" },
    { "@type": "City", name: "Decatur" },
    { "@type": "City", name: "Suwanee" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "33",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    "https://www.google.com/maps/place/Santos+Cleaning+Solutions",
  ],
};

const serviceOffers = {
  "@type": "OfferCatalog",
  name: "Atlanta Cleaning Services",
  itemListElement: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Deep Cleaning Atlanta",
        description:
          "Complete top-to-bottom deep cleaning for homes in Atlanta, GA",
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        minPrice: "199",
        maxPrice: "499",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Regular House Cleaning Atlanta",
        description:
          "Weekly, bi-weekly or monthly recurring cleaning service in Atlanta",
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        minPrice: "129",
        maxPrice: "349",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Move-Out Cleaning Atlanta",
        description:
          "Detailed move-out and move-in cleaning service in Atlanta",
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        minPrice: "249",
        maxPrice: "599",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Office Cleaning Atlanta",
        description:
          "Professional commercial office cleaning service in Atlanta",
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        minPrice: "199",
        maxPrice: "599",
      },
    },
  ],
};

function buildSchema(
  type: SchemaMarkupProps["type"],
  data?: Record<string, unknown>
) {
  const graph: Record<string, unknown>[] = [businessSchema];

  if (type === "home") {
    graph.push({
      "@type": "WebSite",
      name: "Santos Cleaning Solutions",
      url: "https://santoscsolutions.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://santoscsolutions.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    });
    graph.push({
      "@type": "Service",
      "@id": "https://santoscsolutions.com/#services",
      serviceType: "House Cleaning Service",
      provider: { "@id": "https://santoscsolutions.com/#business" },
      areaServed: { "@type": "City", name: "Atlanta" },
      hasOfferCatalog: serviceOffers,
    });
  }

  if (type === "service" && data) {
    graph.push({
      "@type": "Service",
      "@id": `https://santoscsolutions.com/${data.slug}/#service`,
      serviceType: "House Cleaning Service",
      name: data.title as string,
      description: data.description as string,
      provider: { "@id": "https://santoscsolutions.com/#business" },
      areaServed: { "@type": "City", name: "Atlanta" },
      hasOfferCatalog: serviceOffers,
    });
  }

  if (type === "city" && data) {
    graph[0] = {
      ...businessSchema,
      url: `https://santoscsolutions.com/${data.slug}/`,
      address: {
        ...businessSchema.address,
        addressLocality: data.city as string,
        postalCode: data.zip as string,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: data.lat as string,
        longitude: data.lng as string,
      },
      areaServed: {
        "@type": "City",
        name: data.city as string,
      },
    };
    graph.push({
      "@type": "Service",
      "@id": `https://santoscsolutions.com/${data.slug}/#service`,
      serviceType: "House Cleaning Service",
      provider: { "@id": "https://santoscsolutions.com/#business" },
      areaServed: { "@type": "City", name: data.city as string },
      hasOfferCatalog: serviceOffers,
    });
  }

  if (type === "article" && data) {
    graph.push({
      "@type": "Article",
      headline: data.title as string,
      description: data.description as string,
      image: data.image as string,
      datePublished: data.date as string,
      dateModified: data.date as string,
      articleSection: data.category as string || "Cleaning Tips",
      inLanguage: "en-US",
      author: {
        "@type": "Organization",
        name: "Santos Cleaning Solutions",
        url: "https://santoscsolutions.com",
      },
      publisher: {
        "@type": "Organization",
        name: "Santos Cleaning Solutions",
        logo: {
          "@type": "ImageObject",
          url: "https://santoscsolutions.com/images/logo.png",
        },
      },
    });
  }

  if (type === "blog") {
    graph.push({
      "@type": "CollectionPage",
      name: "Cleaning Tips & Insights Blog",
      description:
        "Expert cleaning tips, home maintenance guides, and local insights for Atlanta homeowners.",
      url: "https://santoscsolutions.com/blog",
    });
  }

  if ((type === "faq" || type === "home" || type === "service" || type === "city") && data?.faqs) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: (
        data.faqs as { question: string; answer: string }[]
      ).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  if (data?.breadcrumbs) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: (
        data.breadcrumbs as { name: string; url: string }[]
      ).map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const schema = buildSchema(type, data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
