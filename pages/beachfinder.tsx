import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { PublicBeachesGrid } from '../src/ui/beaches/PublicBeachesGrid';
import { BeachDetailsDrawer } from '../src/ui/beaches/BeachDetailsDrawer';
import { Beach } from '../src/lib/forms';
import {
  TAGS,
  TAG_LABELS,
  MUNICIPALITIES,
  BeachTag
} from '../src/constants/beachVocab';
import {
  trackBeachFinderSectionView,
  trackUseMyLocationClick,
  trackGeolocationDenied,
  trackBeachFiltersChange,
  trackBeachCardClick,
  trackBeachDirectionsClick,
  trackBeachDetailsView
} from '../src/lib/analytics';
import { generateBeachListSchema, generateFAQPageSchema } from '../src/lib/seo';

const BeachMapView = dynamic(() => import('../src/ui/beaches/BeachMapView'), {
  ssr: false,
  loading: () => (
    <div className="prtd-map-container prtd-map-fallback">Loading map…</div>
  )
}) as React.ComponentType<{
  beaches: Beach[];
  userLocation?: { lat: number; lng: number };
  selectedBeach?: Beach | null;
  onBeachDetailsClick?: (beach: Beach) => void;
}>;

export default function BeachFinder() {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [selectedTags, setSelectedTags] = useState<BeachTag[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(50); // km
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(6); // Initial number of beaches to display
  const [mapError, setMapError] = useState(false);

  // Fetch beaches on mount
  useEffect(() => {
    async function fetchBeaches() {
      try {
        setLoading(true);
        const response = await fetch('/api/beaches-light');
        if (!response.ok) {
          throw new Error('Failed to fetch beaches');
        }
        const data = await response.json();
        setBeaches(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching beaches:', err);
        setError('Failed to load beaches. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    fetchBeaches();
  }, []);

  // Track section view after beaches load
  useEffect(() => {
    if (beaches.length > 0) {
      trackBeachFinderSectionView(beaches.length);
    }
  }, [beaches.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(6);
  }, [selectedTags, selectedMunicipality, maxDistance, sortBy]);

  // Filter beaches based on current filters
  const filteredBeaches = React.useMemo(() => {
    let filtered = beaches;

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(beach => 
        selectedTags.some(tag => beach.tags?.includes(tag as BeachTag))
      );
    }

    // Filter by municipality
    if (selectedMunicipality) {
      filtered = filtered.filter(beach => beach.municipality === selectedMunicipality);
    }

    // Filter by distance if user location is available
    if (userLocation) {
      filtered = filtered.filter(beach => {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          beach.coords.lat, beach.coords.lng
        );
        return distance <= maxDistance * 1000; // Convert km to meters
      });
    }

    // Sort beaches
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    // Distance sorting is handled in PublicBeachesGrid

    return filtered;
  }, [beaches, selectedTags, selectedMunicipality, maxDistance, userLocation, sortBy]);

  // Limit displayed beaches for performance
  const displayedBeaches = React.useMemo(() => {
    return filteredBeaches.slice(0, displayCount);
  }, [filteredBeaches, displayCount]);

  const hasMoreBeaches = filteredBeaches.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 6, filteredBeaches.length));
  };

  // Calculate distance between two coordinates
  function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const handleUseMyLocation = () => {
    trackUseMyLocationClick();
    setGeolocationStatus('requesting');

    if (!navigator.geolocation) {
      setGeolocationStatus('denied');
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeolocationStatus('granted');
        setSortBy('distance');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGeolocationStatus('denied');
        trackGeolocationDenied();
        setSortBy('name');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleTagToggle = (tag: BeachTag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    
    trackBeachFiltersChange({
      tags: newTags,
      distance: maxDistance,
      sort: sortBy
    });
  };

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
    
    trackBeachFiltersChange({
      tags: selectedTags,
      distance: maxDistance,
      sort: sortBy
    });
  };

  const handleDistanceChange = (distance: number) => {
    setMaxDistance(distance);
    
    trackBeachFiltersChange({
      tags: selectedTags,
      distance: distance,
      sort: sortBy
    });
  };

  const handleSortChange = (sort: 'distance' | 'name') => {
    setSortBy(sort);
    
    trackBeachFiltersChange({
      tags: selectedTags,
      distance: maxDistance,
      sort: sort
    });
  };

  const handleViewModeChange = (mode: 'list' | 'map') => {
    setViewMode(mode);
    if (mode === 'map') {
      trackBeachFinderSectionView(filteredBeaches.length);
    }
  };

  const handleBeachCardClick = (beach: Beach) => {
    const listIndex = displayedBeaches.findIndex(b => b.id === beach.id);
    const mapIndex = filteredBeaches.findIndex(b => b.id === beach.id);
    const position = listIndex !== -1
      ? listIndex + 1
      : mapIndex !== -1
        ? mapIndex + 1
        : 0;
    trackBeachCardClick(beach, position, selectedTags);
  };

  const handleBeachDirectionsClick = (beach: Beach, distance?: number) => {
    trackBeachDirectionsClick(beach, distance, 'beachfinder');
  };

  const handleBeachDetailsClick = (beach: Beach) => {
    setSelectedBeach(beach);
    setIsDrawerOpen(true);
    trackBeachDetailsView(beach);
    handleBeachCardClick(beach);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedBeach(null);
  };

  const handleDrawerDirectionsClick = () => {
    if (selectedBeach) {
      let distance: number | undefined;
      if (userLocation) {
        distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          selectedBeach.coords.lat, selectedBeach.coords.lng
        );
      }
      trackBeachDirectionsClick(selectedBeach, distance, 'beach_details');
    }
  };

  // Generate ItemList structured data for SEO
  const beachListSchema = generateBeachListSchema(filteredBeaches);

  // Generate FAQ schema for SEO
  const faqSchema = generateFAQPageSchema([
    {
      question: "What are the best beaches in Puerto Rico?",
      answer: "Puerto Rico's top beaches include Flamenco Beach in Culebra (consistently ranked among the world's best), Luquillo Beach for families, Crash Boat Beach in Aguadilla for surfing, and Isla Verde Beach in San Juan for convenience. Each municipality offers unique beach experiences from calm waters to world-class surf breaks."
    },
    {
      question: "Which Puerto Rico beaches are good for snorkeling?",
      answer: "The best snorkeling beaches include Cayo de Tierra in Culebra, Seven Seas Beach in Fajardo, Tamarindo Beach near Culebra, and the beaches around La Parguera in Lajas. These locations offer clear waters, vibrant coral reefs, and diverse marine life including tropical fish, sea turtles, and rays."
    },
    {
      question: "Are Puerto Rico beaches safe for swimming?",
      answer: "Most Puerto Rico beaches are safe for swimming, but conditions vary. Beaches on the north coast (like San Juan and Isabela) have stronger currents and larger waves, ideal for surfing. South coast beaches (Ponce, Guánica) and east coast beaches (Fajardo, Luquillo) typically have calmer waters perfect for families. Always check local conditions, look for lifeguard stations, and respect warning flags."
    },
    {
      question: "Do I need a car to visit Puerto Rico beaches?",
      answer: "While some beaches like Isla Verde in San Juan are accessible by public transport or taxi, a rental car is highly recommended for exploring Puerto Rico's beaches. Many of the island's best beaches are located in remote areas without reliable public transportation. Having a car allows you to visit multiple beaches and discover hidden gems along the coast."
    },
    {
      question: "What is sargassum and how does it affect Puerto Rico beaches?",
      answer: "Sargassum is a type of seaweed that seasonally washes up on Caribbean beaches. In Puerto Rico, east and south coast beaches are more affected, typically between April and August. Our beach finder shows real-time sargassum conditions for each beach. West coast beaches (Rincón, Aguadilla) generally have less sargassum due to prevailing currents."
    }
  ]);

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(beachListSchema, null, 2)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema, null, 2)
          }}
        />
      </Head>

      <SiteLayout>
        <SEO
          title="🏖️ Beach Finder | Puerto Rico Travel Deals"
          description="Discover the best beaches in Puerto Rico. Find nearby beaches, check conditions, and get directions to your perfect beach day."
          canonical="https://puertoricotraveldeals.com/beachfinder"
          keywords={['puerto rico beaches', 'beach finder', 'caribbean beaches', 'best beaches puerto rico', 'aguadilla beaches', 'culebra beaches', 'flamenco beach', 'surf beaches puerto rico', 'snorkeling puerto rico', 'family beaches puerto rico']}
        />

      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-brand-blue to-brand-navy text-white">
        <div className="text-center">
          <div className="mb-4 text-6xl">🏖️</div>
          <Heading level={1} className="mb-4 text-white">
            Find the Best Beaches in Puerto Rico
          </Heading>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Discover 230+ beaches across the island. Use geolocation to find nearby beaches, filter by surfing, snorkeling, or family-friendly amenities, and get directions to your perfect Caribbean beach day.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleUseMyLocation}
              disabled={geolocationStatus === 'requesting'}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand-navy transition-colors hover:bg-brand-sand disabled:opacity-50"
            >
              📍 {geolocationStatus === 'requesting' ? 'Getting Location...' : 'Use My Location'}
            </button>
            
            <div className="text-sm text-white/80">
              {geolocationStatus === 'granted' && '✓ Location enabled - showing nearest beaches'}
              {geolocationStatus === 'denied' && 'Location denied - showing all beaches A-Z'}
            </div>
          </div>
        </div>
      </Section>

      {/* Loading State */}
      {loading && (
        <Section>
          <div className="py-12 text-center">
            <div className="text-brand-navy mb-4 text-xl">Loading beaches...</div>
            <div className="text-brand-navy/60">Finding the best beaches in Puerto Rico</div>
          </div>
        </Section>
      )}

      {/* Error State */}
      {error && !loading && (
        <Section>
          <div className="bg-brand-red/10 border-brand-red/20 text-brand-red rounded-lg border px-6 py-4 text-center">
            <p className="font-semibold">{error}</p>
          </div>
        </Section>
      )}

      {/* Filters Section */}
      {!loading && !error && (
      <Section className="border-b">
        <div className="space-y-6">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg bg-brand-sand p-1">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-brand-navy shadow-sm' 
                  : 'text-brand-navy/60 hover:text-brand-navy'
              }`}
            >
              List
            </button>
            <button
              onClick={() => handleViewModeChange('map')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-brand-navy shadow-sm' 
                  : 'text-brand-navy/60 hover:text-brand-navy'
              }`}
            >
              Map View
            </button>
          </div>

            <div className="text-brand-navy/60 text-sm">
              Showing {displayedBeaches.length} of {filteredBeaches.length} beach{filteredBeaches.length !== 1 ? 'es' : ''}
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Municipality Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-navy">Location</label>
              <select
                value={selectedMunicipality}
                onChange={(e) => handleMunicipalityChange(e.target.value)}
                className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              >
                <option value="">All municipalities</option>
                {MUNICIPALITIES.map(municipality => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            {userLocation && (
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-navy">
                  Max Distance: {maxDistance}km
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Sort Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-navy">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'distance' | 'name')}
                className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              >
                <option value="distance">
                  {userLocation ? 'Closest first' : 'A-Z'}
                </option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Tag Filters */}
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Beach Features</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-brand-blue text-white'
                        : 'bg-brand-sand text-brand-navy hover:bg-brand-blue hover:text-white'
                    }`}
                  >
                    {TAG_LABELS[tag]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
      )}

      {/* SEO Content Section */}
      <Section className="bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-navy mx-auto">
            <h2 className="text-2xl font-bold text-brand-navy">Explore Puerto Rico's Best Beaches</h2>
            <p className="text-brand-navy/80 leading-relaxed">
              Puerto Rico is home to some of the Caribbean's most spectacular beaches, from the world-famous{' '}
              <strong>Flamenco Beach in Culebra</strong> to hidden gems along the northwest coast. Whether you're searching for
              premier <strong>surfing beaches in Aguadilla and Rincón</strong>, calm <strong>snorkeling spots in Fajardo</strong>,
              or <strong>family-friendly beaches</strong> with amenities, our beach finder helps you discover the perfect coastal
              destination.
            </p>
            <p className="text-brand-navy/80 leading-relaxed">
              Use our interactive map and filters to search by municipality, beach features, and real-time conditions including
              sargassum levels, surf conditions, and wind. With over 230 beaches catalogued across Puerto Rico's islands, you'll
              find everything from secluded coves to popular public beaches with parking, restrooms, and lifeguards.
            </p>
          </div>
        </div>
      </Section>

      {/* Results Section */}
      {!loading && !error && (
      <Section>
        {viewMode === 'map' ? (
          filteredBeaches.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🌊</div>
              <h3 className="mb-2 text-xl font-bold text-brand-navy">No beaches match your filters</h3>
              <p className="text-brand-navy/60">Try adjusting your filters or resetting them to explore more of Puerto Rico.</p>
            </div>
          ) : mapError ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🗺️</div>
              <h3 className="mb-2 text-xl font-bold text-brand-navy">Failed to load map</h3>
              <p className="text-brand-navy/60 mb-4">The map couldn't load. Please check your connection and try again.</p>
              <button
                onClick={() => {
                  setMapError(false);
                  setViewMode('list');
                  setTimeout(() => setViewMode('map'), 100);
                }}
                className="rounded-lg bg-brand-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-navy"
              >
                Retry
              </button>
            </div>
          ) : (
            <React.Suspense fallback={<div className="prtd-map-container prtd-map-fallback">Loading map…</div>}>
              <BeachMapView
                beaches={filteredBeaches}
                userLocation={userLocation || undefined}
                selectedBeach={selectedBeach}
                onBeachDetailsClick={handleBeachDetailsClick}
              />
            </React.Suspense>
          )
        ) : (
          <>
            <PublicBeachesGrid
              beaches={displayedBeaches}
              userLocation={userLocation || undefined}
              onBeachDirectionsClick={handleBeachDirectionsClick}
              onBeachDetailsClick={handleBeachDetailsClick}
            />
            
            {/* Load More Button */}
            {hasMoreBeaches && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="rounded-lg bg-brand-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-navy"
                >
                  Load More Beaches ({filteredBeaches.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </Section>
      )}

      {/* FAQ Section */}
      <Section className="bg-brand-sand/30">
        <div className="mx-auto max-w-4xl">
          <Heading level={2} className="mb-8 text-center">
            Frequently Asked Questions
          </Heading>
          <div className="space-y-6">
            <details className="group rounded-lg bg-white p-6 shadow-sm">
              <summary className="cursor-pointer text-lg font-semibold text-brand-navy hover:text-brand-blue">
                What are the best beaches in Puerto Rico?
              </summary>
              <p className="text-brand-navy/80 mt-4 leading-relaxed">
                Puerto Rico's top beaches include Flamenco Beach in Culebra (consistently ranked among the world's best),
                Luquillo Beach for families, Crash Boat Beach in Aguadilla for surfing, and Isla Verde Beach in San Juan
                for convenience. Each municipality offers unique beach experiences from calm waters to world-class surf breaks.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm">
              <summary className="cursor-pointer text-lg font-semibold text-brand-navy hover:text-brand-blue">
                Which Puerto Rico beaches are good for snorkeling?
              </summary>
              <p className="text-brand-navy/80 mt-4 leading-relaxed">
                The best snorkeling beaches include Cayo de Tierra in Culebra, Seven Seas Beach in Fajardo, Tamarindo Beach
                near Culebra, and the beaches around La Parguera in Lajas. These locations offer clear waters, vibrant coral
                reefs, and diverse marine life including tropical fish, sea turtles, and rays.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm">
              <summary className="cursor-pointer text-lg font-semibold text-brand-navy hover:text-brand-blue">
                Are Puerto Rico beaches safe for swimming?
              </summary>
              <p className="text-brand-navy/80 mt-4 leading-relaxed">
                Most Puerto Rico beaches are safe for swimming, but conditions vary. Beaches on the north coast (like San Juan
                and Isabela) have stronger currents and larger waves, ideal for surfing. South coast beaches (Ponce, Guánica)
                and east coast beaches (Fajardo, Luquillo) typically have calmer waters perfect for families. Always check local
                conditions, look for lifeguard stations, and respect warning flags.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm">
              <summary className="cursor-pointer text-lg font-semibold text-brand-navy hover:text-brand-blue">
                Do I need a car to visit Puerto Rico beaches?
              </summary>
              <p className="text-brand-navy/80 mt-4 leading-relaxed">
                While some beaches like Isla Verde in San Juan are accessible by public transport or taxi, a rental car is highly
                recommended for exploring Puerto Rico's beaches. Many of the island's best beaches are located in remote areas
                without reliable public transportation. Having a car allows you to visit multiple beaches and discover hidden gems
                along the coast.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm">
              <summary className="cursor-pointer text-lg font-semibold text-brand-navy hover:text-brand-blue">
                What is sargassum and how does it affect Puerto Rico beaches?
              </summary>
              <p className="text-brand-navy/80 mt-4 leading-relaxed">
                Sargassum is a type of seaweed that seasonally washes up on Caribbean beaches. In Puerto Rico, east and south
                coast beaches are more affected, typically between April and August. Our beach finder shows real-time sargassum
                conditions for each beach. West coast beaches (Rincón, Aguadilla) generally have less sargassum due to prevailing
                currents.
              </p>
            </details>
          </div>
        </div>
      </Section>

      {/* Beach Details Drawer */}
      <BeachDetailsDrawer
        beach={selectedBeach}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        distance={
          selectedBeach && userLocation
            ? calculateDistance(
                userLocation.lat, userLocation.lng,
                selectedBeach.coords.lat, selectedBeach.coords.lng
              )
            : undefined
        }
        onDirectionsClick={handleDrawerDirectionsClick}
      />
      </SiteLayout>
    </>
  );
}
