import { Deal, Event, Beach } from './forms';

// Structured Data Schemas

export interface OfferSchema {
  "@context": "https://schema.org";
  "@type": "Offer";
  name: string;
  description?: string;
  price?: number;
  priceCurrency?: string;
  availability: string;
  validThrough?: string;
  seller: {
    "@type": "Organization";
    name: string;
  };
  areaServed: string;
  category: string;
  url?: string;
}

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "TravelAgency";
  name: string;
  alternateName: string;
  description: string;
  url: string;
  sameAs: string[];
  areaServed: string;
}

export function generateDealStructuredData(deal: Deal, dealUrl?: string): OfferSchema {
  const schema: OfferSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: deal.title,
    description: deal.fullDescription || deal.description,
    availability: deal.expiry ? "LimitedAvailability" : "InStock",
    seller: {
      "@type": "Organization",
      name: "PRTD - Puerto Rico Travel Deals"
    },
    areaServed: "Puerto Rico",
    category: deal.category
  };

  // Only include price data when available (following existing pattern)
  if (deal.price && deal.price > 0) {
    schema.price = deal.price;
    schema.priceCurrency = deal.currency || 'USD';
  }

  if (deal.expiry) {
    schema.validThrough = deal.expiry;
  }

  if (dealUrl) {
    schema.url = dealUrl;
  }

  return schema;
}

export function generateOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Puerto Rico Travel Deals",
    alternateName: "PRTD",
    description: "Island-wide discounts on hotels, dining, and experiences—curated by locals",
    url: "https://puertoricotraveldeals.com",
    sameAs: ["https://www.instagram.com/puertoricotraveldeals"],
    areaServed: "Puerto Rico"
  };
}

// Dynamic Meta Tags

export interface CategoryMeta {
  title: string;
  description: string;
  keywords: string[];
}

export const categoryMetaTemplates: Record<string, CategoryMeta> = {
  hotel: {
    title: "Puerto Rico Hotel Deals - Beachfront Resorts & City Hotels",
    description: "Save up to 60% on Puerto Rico hotels. From Old San Juan boutiques to Culebra beach resorts. Curated by locals, updated daily.",
    keywords: ["Puerto Rico hotels", "beachfront resorts", "Old San Juan", "Culebra", "hotel deals", "Caribbean accommodation"]
  },
  activity: {
    title: "Puerto Rico Adventures & Activities - Kayaking, Skydiving & Tours", 
    description: "Discover authentic Puerto Rico experiences. Rainforest hikes, water sports, cultural tours. Local insider deals updated daily.",
    keywords: ["Puerto Rico activities", "El Yunque", "kayaking", "skydiving", "water sports", "authentic experiences"]
  },
  restaurant: {
    title: "Puerto Rico Restaurant Deals - Local Cuisine & Fine Dining",
    description: "Taste authentic Puerto Rico with local restaurant deals. From mofongo to fine dining, discover island flavors at unbeatable prices.",
    keywords: ["Puerto Rico restaurants", "local cuisine", "mofongo", "fine dining", "authentic food", "Caribbean flavors"]
  },
  tour: {
    title: "Puerto Rico Tour Deals - Cultural, Historical & Nature Tours",
    description: "Explore Puerto Rico with guided tours. Historical Old San Juan, El Yunque rainforest, bioluminescent bay adventures at discounted prices.",
    keywords: ["Puerto Rico tours", "Old San Juan tours", "El Yunque", "bioluminescent bay", "cultural tours", "nature tours"]
  }
};

export interface DealMeta {
  title: string;
  description: string;
  canonical: string;
  image: string;
  keywords: string[];
}

export function generateDealMeta(deal: Deal): DealMeta {
  const categoryInfo = categoryMetaTemplates[deal.category] || categoryMetaTemplates.activity;
  
  const title = `${deal.title} - ${deal.amountLabel} Off Puerto Rico ${deal.category.charAt(0).toUpperCase() + deal.category.slice(1)}`;
  
  let description = deal.description;
  if (description.length > 155) {
    description = description.substring(0, 152) + '...';
  }
  description += ` Book now and save in ${deal.location}, Puerto Rico.`;

  const keywords = [
    deal.title.toLowerCase(),
    deal.location.toLowerCase(),
    `Puerto Rico ${deal.category}`,
    deal.amountLabel.toLowerCase(),
    ...categoryInfo.keywords.slice(0, 3) // Include some category keywords
  ];

  return {
    title,
    description,
    canonical: `https://puertoricotraveldeals.com/deal/${deal.slug}`,
    image: deal.image.startsWith('/') ? `https://puertoricotraveldeals.com${deal.image}` : deal.image,
    keywords
  };
}

// Location-based meta templates
export const locationMetaTemplates: Record<string, CategoryMeta> = {
  'san-juan': {
    title: 'San Juan Puerto Rico Deals - Hotels, Dining & Activities',
    description: 'Discover the best deals in Puerto Rico\'s capital. Historic Old San Juan hotels, Condado beach resorts, local dining, and cultural experiences.',
    keywords: ['San Juan', 'Old San Juan', 'Condado', 'El Morro', 'La Fortaleza', 'Puerto Rico capital']
  },
  'culebra': {
    title: 'Culebra Puerto Rico Deals - Beach Resorts & Island Adventures',
    description: 'Escape to Culebra island with exclusive deals. Pristine beaches, snorkeling adventures, and boutique accommodations at unbeatable prices.',
    keywords: ['Culebra', 'Flamenco Beach', 'island getaway', 'snorkeling', 'pristine beaches', 'Caribbean island']
  },
  'old-san-juan': {
    title: 'Old San Juan Deals - Historic Hotels & Cultural Experiences',
    description: 'Step back in time with Old San Juan deals. Colonial architecture hotels, historic tours, authentic cuisine in Puerto Rico\'s cultural heart.',
    keywords: ['Old San Juan', 'colonial architecture', 'historic district', 'El Morro', 'cobblestone streets', 'UNESCO World Heritage']
  }
};

export function generateCategoryMeta(category: string, location?: string): CategoryMeta {
  const baseMeta = categoryMetaTemplates[category] || categoryMetaTemplates.activity;
  
  if (location) {
    const locationInfo = locationMetaTemplates[location.toLowerCase().replace(/\s+/g, '-')];
    if (locationInfo) {
      return {
        title: `${location} ${baseMeta.title}`,
        description: `${baseMeta.description} Featuring the best ${category} deals in ${location}.`,
        keywords: [...baseMeta.keywords, ...locationInfo.keywords]
      };
    }
  }
  
  return baseMeta;
}

// Event Structured Data Schemas
export interface EventSchema {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  startDate: string;
  endDate?: string;
  eventStatus: string;
  location: {
    "@type": "Place";
    name: string;
    address?: string;
  };
  organizer?: {
    "@type": "Organization";
    name: string;
  };
  image?: string;
  url?: string;
  offers?: {
    "@type": "Offer";
    price?: number;
    priceCurrency?: string;
    availability: string;
  };
}

export interface EventSeriesSchema {
  "@context": "https://schema.org";
  "@type": "EventSeries";
  name: string;
  startDate: string;
  endDate: string;
  location: {
    "@type": "Place";
    name: string;
  };
  organizer: {
    "@type": "Organization";
    name: string;
  };
  subEvent: EventSchema[];
}

export function generateEventStructuredData(event: Event, eventUrl?: string): EventSchema {
  const schema: EventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDateTime,
    eventStatus: event.status === 'canceled' ? 'https://schema.org/EventCancelled' :
                event.status === 'postponed' ? 'https://schema.org/EventPostponed' :
                event.status === 'sold_out' ? 'https://schema.org/EventMovedOnline' :
                'https://schema.org/EventScheduled',
    location: {
      "@type": "Place",
      name: event.venueName || event.city,
      address: event.address
    }
  };

  if (event.endDateTime) {
    schema.endDate = event.endDateTime;
  }

  if (event.source) {
    schema.organizer = {
      "@type": "Organization",
      name: event.source
    };
  }

  if (event.heroImage?.url) {
    schema.image = event.heroImage.url.startsWith('/') ? 
      `${process.env.NODE_ENV === 'production' ? 'https://puertoricotraveldeals.com' : ''}${event.heroImage.url}` : 
      event.heroImage.url;
  }

  if (eventUrl) {
    schema.url = eventUrl;
  }

  // Prefer canonical URL if available
  if (event.canonicalUrl) {
    schema.url = event.canonicalUrl;
  }

  // Add offers if pricing is available
  if (event.priceFrom && !event.free) {
    schema.offers = {
      "@type": "Offer",
      price: event.priceFrom,
      priceCurrency: "USD",
      availability: event.status === 'sold_out' ? 
        "https://schema.org/SoldOut" : 
        "https://schema.org/InStock"
    };
  }

  return schema;
}

export function generateEventSeriesStructuredData(events: Event[], weekStart: string): EventSeriesSchema {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday of the same week
  
  return {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: `Puerto Rico Weekly Events - Week of ${new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    startDate: weekStart,
    endDate: weekEnd.toISOString().split('T')[0],
    location: {
      "@type": "Place",
      name: "Puerto Rico"
    },
    organizer: {
      "@type": "Organization",
      name: "Puerto Rico Travel Deals"
    },
    subEvent: events.map(event => generateEventStructuredData(event))
  };
}

// Beach SEO Functions

export interface BeachMeta {
  title: string;
  description: string;
  canonical: string;
  image: string;
  keywords: string[];
}

export function generateBeachMeta(beach: Beach): BeachMeta {
  const title = `${beach.name} Beach - ${beach.municipality}, Puerto Rico | Beach Guide`;
  
  // Use first 155 chars of notes for description, with fallback
  let description = beach.notes 
    ? beach.notes.length > 155 
      ? beach.notes.substring(0, 152) + '...'
      : beach.notes
    : `Discover ${beach.name} beach in ${beach.municipality}. ${beach.tags?.slice(0,2).map(tag => tag.replace(/_/g, ' ')).join(', ') || 'Beautiful'} beach in Puerto Rico.`;
  
  // Ensure it has location context
  if (!description.includes('Puerto Rico')) {
    description += ` Located in ${beach.municipality}, Puerto Rico.`;
  }

  const keywords = [
    beach.name.toLowerCase(),
    `${beach.municipality.toLowerCase()} beach`,
    'puerto rico beaches',
    'caribbean beaches',
    ...(beach.tags?.slice(0, 3) || [])
  ];

  return {
    title,
    description,
    canonical: `https://puertoricotraveldeals.com/beaches/${beach.slug}`,
    image: beach.coverImage.startsWith('/') 
      ? `https://puertoricotraveldeals.com${beach.coverImage}`
      : beach.coverImage,
    keywords
  };
}

// JSON-LD structured data for beaches
export interface PlaceSchema {
  "@context": "https://schema.org";
  "@type": "Place" | "Beach";
  name: string;
  description?: string;
  url?: string;
  image?: string;
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  address: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  amenityFeature?: Array<{
    "@type": "LocationFeatureSpecification";
    name: string;
    value: boolean;
  }>;
  additionalProperty?: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string;
  }>;
}

export function generateBeachStructuredData(beach: Beach, beachUrl?: string): PlaceSchema {
  const schema: PlaceSchema = {
    "@context": "https://schema.org",
    "@type": "Beach", // More specific than Place
    name: beach.name,
    description: beach.notes || `${beach.name} beach in ${beach.municipality}, Puerto Rico`,
    url: beachUrl || `https://puertoricotraveldeals.com/beaches/${beach.slug}`,
    image: beach.coverImage.startsWith('/') 
      ? `https://puertoricotraveldeals.com${beach.coverImage}`
      : beach.coverImage,
    geo: {
      "@type": "GeoCoordinates",
      latitude: beach.coords.lat,
      longitude: beach.coords.lng
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: beach.municipality,
      addressRegion: "Puerto Rico",
      addressCountry: "US"
    }
  };

  // Add amenities as features
  if (beach.amenities && beach.amenities.length > 0) {
    schema.amenityFeature = beach.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: true
    }));
  }

  // Add beach characteristics as additional properties
  const additionalProps: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string;
  }> = [];
  
  if (beach.tags && beach.tags.length > 0) {
    additionalProps.push({
      "@type": "PropertyValue",
      name: "Beach Type",
      value: beach.tags.join(', ').replace(/_/g, ' ')
    });
  }

  if (beach.sargassum) {
    additionalProps.push({
      "@type": "PropertyValue", 
      name: "Sargassum Level",
      value: beach.sargassum
    });
  }

  if (beach.surf) {
    additionalProps.push({
      "@type": "PropertyValue",
      name: "Surf Conditions", 
      value: beach.surf
    });
  }

  if (beach.accessLabel) {
    additionalProps.push({
      "@type": "PropertyValue",
      name: "Access",
      value: beach.accessLabel
    });
  }

  if (additionalProps.length > 0) {
    schema.additionalProperty = additionalProps;
  }

  return schema;
}

// BreadcrumbList Schema
export interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}

// ImageObject Schema
export interface ImageObjectSchema {
  "@context": "https://schema.org";
  "@type": "ImageObject";
  url: string;
  caption: string;
  width?: number;
  height?: number;
}

export function generateImageObjectSchema(url: string, caption: string, width?: number, height?: number): ImageObjectSchema {
  const schema: ImageObjectSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    url,
    caption
  };

  if (width) {
    schema.width = width;
  }

  if (height) {
    schema.height = height;
  }

  return schema;
}

// FAQPage Schema
export interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export function generateFAQPageSchema(faqs: Array<{question: string, answer: string}>): FAQPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

// ItemList Schema
export interface ItemListSchema {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name: string;
  description?: string;
  numberOfItems: number;
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    item: {
      "@type": "Beach" | "Place";
      name: string;
      url: string;
      image?: string;
      description?: string;
      geo?: {
        "@type": "GeoCoordinates";
        latitude: number;
        longitude: number;
      };
    };
  }>;
}

export function generateBeachListSchema(beaches: Beach[], baseUrl: string = 'https://puertoricotraveldeals.com'): ItemListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Beaches in Puerto Rico",
    description: "Comprehensive guide to Puerto Rico's beaches including surfing spots, snorkeling locations, and family-friendly beaches",
    numberOfItems: beaches.length,
    itemListElement: beaches.slice(0, 20).map((beach, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Beach",
        name: beach.name,
        url: `${baseUrl}/beaches/${beach.slug}`,
        image: beach.coverImage.startsWith('/')
          ? `${baseUrl}${beach.coverImage}`
          : beach.coverImage,
        description: beach.notes || `${beach.name} beach in ${beach.municipality}, Puerto Rico`,
        geo: {
          "@type": "GeoCoordinates",
          latitude: beach.coords.lat,
          longitude: beach.coords.lng
        }
      }
    }))
  };
}

// Deal ItemList Schema
export function generateDealListSchema(deals: Deal[], baseUrl: string = 'https://puertoricotraveldeals.com'): ItemListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Puerto Rico Travel Deals",
    description: "Exclusive travel deals for Puerto Rico including hotels, restaurants, activities, and tours",
    numberOfItems: deals.length,
    itemListElement: deals.slice(0, 20).map((deal, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Place",
        name: deal.title,
        url: `${baseUrl}/deal/${deal.slug}`,
        image: deal.image.startsWith('/')
          ? `${baseUrl}${deal.image}`
          : deal.image,
        description: deal.description || deal.fullDescription || `${deal.title} - ${deal.amountLabel} off in ${deal.location}, Puerto Rico`
      }
    }))
  };
}

// Utility function to generate JSON-LD script tag
export function generateStructuredDataScript(data: OfferSchema | OrganizationSchema | EventSchema | EventSeriesSchema | PlaceSchema | BreadcrumbSchema | ImageObjectSchema | FAQPageSchema | ItemListSchema): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}