import React from 'react';
import { Event } from '../../lib/forms';
import { 
  isEventExpired, 
  isEventCanceled, 
  formatEventDate, 
  generateMapUrl, 
  appendUtmToEventUrl,
  getEventStatusBadge,
  getGenreBadgeColor 
} from '../../lib/eventUtils';

interface PublicEventCardProps {
  event: Event;
  weekStart: string;
  isSponsored?: boolean;
}

export const PublicEventCard: React.FC<PublicEventCardProps> = ({ event, weekStart, isSponsored = false }) => {
  const expired = isEventExpired(event);
  const canceled = isEventCanceled(event);
  const statusBadge = getEventStatusBadge(event);
  const genreColor = getGenreBadgeColor(event.genre);
  const mapUrl = generateMapUrl(event.venueName, event.address, event.city);
  
  const handleTicketsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (event.links?.tickets) {
      const urlWithUTM = isSponsored ? 
        appendUtmToEventUrl(event.links.tickets, weekStart) : 
        event.links.tickets;
      window.open(urlWithUTM, '_blank', 'noopener noreferrer');
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (event.links?.details) {
      const urlWithUTM = isSponsored ? 
        appendUtmToEventUrl(event.links.details, weekStart) : 
        event.links.details;
      window.open(urlWithUTM, '_blank', 'noopener noreferrer');
    }
  };
  
  return (
    <div className={`ring-brand-navy/10 hover:ring-brand-blue/20 relative overflow-hidden rounded-xl bg-white ring-1 transition-all duration-200 hover:shadow-md ${canceled ? 'opacity-60' : ''}`}>
      {/* Sponsored Label */}
      {isSponsored && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-brand-blue px-2 py-1 text-xs font-bold text-white shadow-lg">
          Sponsored
        </div>
      )}
      
      {/* 16:9 Aspect Ratio Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-brand-sand">
        {event.heroImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={event.heroImage.url} 
            alt={event.heroImage.alt}
            className="size-full object-cover"
          />
        ) : (
          <div className="text-brand-navy/30 flex size-full items-center justify-center">
            <svg className="size-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {statusBadge.text && (
          <div className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-bold shadow-lg ${statusBadge.className}`}>
            {statusBadge.text}
          </div>
        )}
      </div>
      
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-lg font-bold leading-tight text-brand-navy">
            {event.title.length > 60 ? `${event.title.slice(0, 60)}...` : event.title}
          </h3>
          <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-bold capitalize ${genreColor}`}>
            {event.genre}
          </span>
        </div>
        
        {/* Event Details */}
        <div className="space-y-1 text-sm">
          <div className="text-brand-navy/80 font-medium">
            {formatEventDate(event.startDateTime, event.endDateTime)}
          </div>
          <div className="text-brand-navy/60">
            {event.venueName ? `${event.venueName}, ${event.city}` : event.city}
          </div>
          {event.priceFrom && !event.free && (
            <div className="font-semibold text-brand-navy">
              From ${event.priceFrom}
            </div>
          )}
          {event.free && (
            <div className="font-semibold text-green-600">
              Free Event
            </div>
          )}
        </div>
        
        {/* Description */}
        {event.descriptionShort && (
          <p className="text-brand-navy/70 text-sm leading-relaxed">
            {event.descriptionShort.length > 120 ? 
              `${event.descriptionShort.slice(0, 120)}...` : 
              event.descriptionShort
            }
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {event.links?.tickets && !canceled && !expired && (
            <button
              onClick={handleTicketsClick}
              className="flex-1 rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy"
            >
              Get Tickets
            </button>
          )}
          
          {event.links?.details && (
            <button
              onClick={handleDetailsClick}
              className="bg-brand-navy/10 flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-blue hover:text-white"
            >
              Learn More
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              window.open(mapUrl, '_blank', 'noopener noreferrer');
            }}
            className="hover:bg-brand-navy/10 rounded-lg bg-brand-sand px-3 py-2 text-sm font-medium text-brand-navy transition-colors"
            title="View on map"
          >
            📍
          </button>
        </div>
      </div>
    </div>
  );
};