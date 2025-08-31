import React, { useState, useMemo } from 'react';
import { Event } from '../../lib/forms';
import { PublicEventCard } from './PublicEventCard';

interface PublicEventsGridProps {
  events: Event[];
  weekStart: string;
  showFilters?: boolean;
  initialCity?: string;
  initialGenre?: string;
}

const CITIES = ['San Juan', 'Bayamón', 'Ponce', 'Mayagüez', 'Caguas', 'Arecibo', 'Guaynabo'] as const;
const GENRES = ['music', 'food', 'art', 'sports', 'family', 'nightlife', 'culture'] as const;

export const PublicEventsGrid: React.FC<PublicEventsGridProps> = ({ 
  events, 
  weekStart, 
  showFilters = true,
  initialCity = '',
  initialGenre = ''
}) => {
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);

  // Apply sponsorship placement rules
  const { heroEvent, regularEvents } = useMemo(() => {
    const heroEvent = events.find(e => e.sponsorPlacement === 'hero');
    const nonHeroEvents = events.filter(e => e.sponsorPlacement !== 'hero');
    const featuredEvents = events.filter(e => e.sponsorPlacement === 'featured');
    
    // Insert featured events every 4th position
    const regularEvents: Event[] = [];
    let featuredIndex = 0;
    
    nonHeroEvents.forEach((event, index) => {
      regularEvents.push(event);
      
      // Insert featured event after every 4th regular event
      if ((index + 1) % 4 === 0 && featuredIndex < featuredEvents.length) {
        regularEvents.push(featuredEvents[featuredIndex]);
        featuredIndex++;
      }
    });
    
    return { heroEvent, regularEvents };
  }, [events]);

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    return regularEvents.filter(event => {
      if (selectedCity && event.city !== selectedCity) return false;
      if (selectedGenre && event.genre !== selectedGenre) return false;
      return true;
    });
  }, [regularEvents, selectedCity, selectedGenre]);

  const availableCities = useMemo(() => {
    const eventCities = [...new Set(events.map(e => e.city))];
    return CITIES.filter(city => eventCities.includes(city));
  }, [events]);

  const availableGenres = useMemo(() => {
    const eventGenres = [...new Set(events.map(e => e.genre))];
    return GENRES.filter(genre => eventGenres.includes(genre));
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Hero Sponsored Event */}
      {heroEvent && (
        <div className="border-brand-blue/20 from-brand-blue/5 rounded-xl border-2 bg-gradient-to-r to-brand-sand p-4">
          <div className="mb-3 text-sm font-semibold text-brand-blue">Featured Event</div>
          <PublicEventCard 
            event={heroEvent} 
            weekStart={weekStart} 
            isSponsored={true}
          />
        </div>
      )}

      {/* Filters */}
      {showFilters && (availableCities.length > 1 || availableGenres.length > 1) && (
        <div className="flex flex-wrap gap-3">
          {/* City Filter */}
          {availableCities.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-brand-navy/70 text-sm font-medium">City:</span>
              <button
                onClick={() => setSelectedCity('')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCity === '' 
                    ? 'bg-brand-blue text-white' 
                    : 'hover:bg-brand-blue/10 bg-brand-sand text-brand-navy'
                }`}
              >
                All
              </button>
              {availableCities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    selectedCity === city 
                      ? 'bg-brand-blue text-white' 
                      : 'hover:bg-brand-blue/10 bg-brand-sand text-brand-navy'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Genre Filter */}
          {availableGenres.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-brand-navy/70 text-sm font-medium">Genre:</span>
              <button
                onClick={() => setSelectedGenre('')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedGenre === '' 
                    ? 'bg-brand-blue text-white' 
                    : 'hover:bg-brand-blue/10 bg-brand-sand text-brand-navy'
                }`}
              >
                All
              </button>
              {availableGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
                    selectedGenre === genre 
                      ? 'bg-brand-blue text-white' 
                      : 'hover:bg-brand-blue/10 bg-brand-sand text-brand-navy'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-brand-sand/50 border-brand-navy/10 rounded-lg border px-6 py-8 text-center">
          <p className="text-brand-navy/70">
            {selectedCity || selectedGenre ? 
              'No events match your selected filters.' : 
              'No events scheduled for this week.'
            }
          </p>
          {(selectedCity || selectedGenre) && (
            <button
              onClick={() => {
                setSelectedCity('');
                setSelectedGenre('');
              }}
              className="mt-2 text-sm font-medium text-brand-blue transition-colors hover:text-brand-navy"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const isSponsored = event.sponsorPlacement === 'featured';
            return (
              <PublicEventCard 
                key={event.id} 
                event={event} 
                weekStart={weekStart}
                isSponsored={isSponsored}
              />
            );
          })}
        </div>
      )}
      
      {/* Results Count */}
      <div className="text-brand-navy/50 text-center text-sm">
        Showing {filteredEvents.length} of {regularEvents.length} events
        {selectedCity && ` in ${selectedCity}`}
        {selectedGenre && ` for ${selectedGenre}`}
      </div>
    </div>
  );
};