import { Deal } from './forms';

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

// Utility function to generate JSON-LD script tag
export function generateStructuredDataScript(data: OfferSchema | OrganizationSchema): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}