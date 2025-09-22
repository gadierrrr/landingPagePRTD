/**
 * Beach vocabulary constants - central source of truth for controlled vocabularies
 * Used across Beach Finder forms, validation, and filtering
 */

export const TAGS = [
  'calm-waters',
  'surfing', 
  'snorkeling',
  'family-friendly',
  'accessible',
  'secluded',
  'popular',
  'scenic',
  'swimming',
  'diving',
  'fishing',
  'camping'
] as const;

export const AMENITIES = [
  'restrooms',
  'showers', 
  'lifeguard',
  'parking',
  'food',
  'equipment-rental',
  'accessibility',
  'picnic-areas',
  'shade-structures',
  'water-sports'
] as const;

export const CONDITION_SCALES = {
  sargassum: ['none', 'light', 'moderate', 'heavy'] as const,
  surf: ['calm', 'small', 'medium', 'large'] as const,
  wind: ['calm', 'light', 'moderate', 'strong'] as const
} as const;

// Puerto Rico municipalities (including main island + Vieques + Culebra)
export const MUNICIPALITIES = [
  'Adjuntas', 'Aguada', 'Aguadilla', 'Aguas Buenas', 'Aibonito', 'Arecibo',
  'Arroyo', 'Barceloneta', 'Barranquitas', 'Bayamón', 'Cabo Rojo', 'Caguas',
  'Camuy', 'Canóvanas', 'Carolina', 'Cataño', 'Cayey', 'Ceiba', 'Cidra',
  'Coamo', 'Comerío', 'Corozal', 'Culebra', 'Dorado', 'Fajardo', 'Florida',
  'Guánica', 'Guayama', 'Guayanilla', 'Guaynabo', 'Gurabo', 'Hatillo',
  'Hormigueros', 'Humacao', 'Isabela', 'Jayuya', 'Juana Díaz', 'Juncos',
  'Lajas', 'Lares', 'Las Marías', 'Las Piedras', 'Loíza', 'Luquillo',
  'Manatí', 'Maricao', 'Maunabo', 'Mayagüez', 'Moca', 'Morovis', 'Naguabo',
  'Naranjito', 'Orocovis', 'Patillas', 'Peñuelas', 'Ponce', 'Quebradillas',
  'Rincón', 'Río Grande', 'Sabana Grande', 'Salinas', 'San Germán',
  'San Juan', 'San Lorenzo', 'San Sebastián', 'Santa Isabel', 'Toa Alta',
  'Toa Baja', 'Trujillo Alto', 'Utuado', 'Vega Alta', 'Vega Baja', 'Vieques',
  'Villalba', 'Yabucoa', 'Yauco'
] as const;

// Puerto Rico coordinate boundaries (including Vieques and Culebra)
export const PR_BOUNDS = {
  lat: { min: 17.8, max: 18.6 },
  lng: { min: -67.4, max: -65.2 }
} as const;

// Display labels for tags
export const TAG_LABELS: Record<typeof TAGS[number], string> = {
  'calm-waters': 'Calm Waters',
  'surfing': 'Surfing',
  'snorkeling': 'Snorkeling', 
  'family-friendly': 'Family Friendly',
  'accessible': 'Accessible',
  'secluded': 'Secluded',
  'popular': 'Popular',
  'scenic': 'Scenic',
  'swimming': 'Swimming',
  'diving': 'Diving',
  'fishing': 'Fishing',
  'camping': 'Camping'
} as const;

// Display labels for amenities
export const AMENITY_LABELS: Record<typeof AMENITIES[number], string> = {
  'restrooms': 'Restrooms',
  'showers': 'Showers',
  'lifeguard': 'Lifeguard',
  'parking': 'Parking',
  'food': 'Food & Drinks',
  'equipment-rental': 'Equipment Rental',
  'accessibility': 'Wheelchair Accessible',
  'picnic-areas': 'Picnic Areas',
  'shade-structures': 'Shade/Umbrellas',
  'water-sports': 'Water Sports'
} as const;

// Display labels for conditions
export const CONDITION_LABELS = {
  sargassum: {
    none: 'No Sargassum',
    light: 'Light Sargassum',
    moderate: 'Moderate Sargassum', 
    heavy: 'Heavy Sargassum'
  },
  surf: {
    calm: 'Calm',
    small: 'Small Waves',
    medium: 'Medium Waves',
    large: 'Large Waves'
  },
  wind: {
    calm: 'Calm',
    light: 'Light Breeze',
    moderate: 'Moderate Wind',
    strong: 'Strong Wind'
  }
} as const;

// Type exports for TypeScript
export type BeachTag = typeof TAGS[number];
export type BeachAmenity = typeof AMENITIES[number];
export type SargassumLevel = typeof CONDITION_SCALES.sargassum[number];
export type SurfLevel = typeof CONDITION_SCALES.surf[number]; 
export type WindLevel = typeof CONDITION_SCALES.wind[number];
export type Municipality = typeof MUNICIPALITIES[number];