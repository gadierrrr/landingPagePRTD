import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { PublicBeachesGrid } from '../src/ui/beaches/PublicBeachesGrid';
import { BeachDetailsDrawer } from '../src/ui/beaches/BeachDetailsDrawer';
import { Beach } from '../src/lib/forms';
import { readBeaches } from '../src/lib/beachesStore';
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

interface BeachFinderProps {
  beaches: Beach[];
}

export default function BeachFinder({ beaches }: BeachFinderProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [selectedTags, setSelectedTags] = useState<BeachTag[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(50); // km
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(9); // Initial number of beaches to display

  // Track section view on mount
  useEffect(() => {
    trackBeachFinderSectionView(beaches.length);
  }, [beaches.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(9);
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

  const handleBeachCardClick = (beach: Beach) => {
    const position = displayedBeaches.findIndex(b => b.id === beach.id) + 1;
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

  return (
    <SiteLayout>
      <SEO
        title="🏖️ Beach Finder | Puerto Rico Travel Deals"
        description="Discover the best beaches in Puerto Rico. Find nearby beaches, check conditions, and get directions to your perfect beach day."
        canonical="/beachfinder"
      />

      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-brand-blue to-brand-navy text-white">
        <div className="text-center">
          <div className="mb-4 text-6xl">🏖️</div>
          <Heading level={1} className="mb-4 text-white">
            Beach Finder
          </Heading>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Discover the perfect beach for your next adventure. Find nearby beaches, check current conditions, and get directions.
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

      {/* Filters Section */}
      <Section className="border-b">
        <div className="space-y-6">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg bg-brand-sand p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-brand-navy shadow-sm' 
                    : 'text-brand-navy/60 hover:text-brand-navy'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-white text-brand-navy shadow-sm' 
                    : 'text-brand-navy/60 hover:text-brand-navy'
                }`}
              >
                Map (Coming Soon)
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

      {/* Results Section */}
      <Section>
        {viewMode === 'map' ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-4xl">🗺️</div>
            <h3 className="mb-2 text-xl font-bold text-brand-navy">Map View Coming Soon</h3>
            <p className="text-brand-navy/60">We're working on an interactive map to help you visualize beach locations.</p>
          </div>
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
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const beaches = await readBeaches();
    
    return {
      props: {
        beaches: beaches || []
      },
      revalidate: 300 // Revalidate every 5 minutes
    };
  } catch (error) {
    console.error('Error loading beaches for static props:', error);
    
    return {
      props: {
        beaches: []
      },
      revalidate: 60 // Retry more frequently on error
    };
  }
};