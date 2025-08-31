import React from 'react';
import { Event } from '../../lib/forms';
import { Button } from '../Button';
import { 
  formatEventDate, 
  getEventStatusBadge, 
  getGenreBadgeColor,
  isEventCanceled 
} from '../../lib/eventUtils';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const statusBadge = getEventStatusBadge(event);
  const genreColor = getGenreBadgeColor(event.genre);
  const canceled = isEventCanceled(event);
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      onDelete(event.id!);
    }
  };

  return (
    <div className={`ring-brand-navy/10 space-y-4 rounded-xl bg-white p-4 ring-1 ${canceled ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="line-clamp-2 font-semibold text-brand-navy">
            {event.title}
          </h3>
          <div className="text-brand-navy/60 mt-1 text-sm">
            {formatEventDate(event.startDateTime, event.endDateTime)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Genre Badge */}
          <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-bold capitalize ${genreColor}`}>
            {event.genre}
          </span>
          
          {/* Status Badge */}
          {statusBadge.text && (
            <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-bold ${statusBadge.className}`}>
              {statusBadge.text}
            </span>
          )}
          
          {/* Sponsored Badge */}
          {event.sponsorPlacement && (
            <span className="bg-brand-blue/10 inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-bold text-brand-blue">
              {event.sponsorPlacement === 'hero' ? 'Hero' : 'Featured'}
            </span>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {event.heroImage && (
        <div className="aspect-[16/9] overflow-hidden rounded-lg bg-brand-sand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={event.heroImage.url} 
            alt={event.heroImage.alt}
            className="size-full object-cover"
          />
        </div>
      )}

      {/* Event Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-brand-navy/60">Location:</span>
          <span className="text-brand-navy">
            {event.venueName ? `${event.venueName}, ${event.city}` : event.city}
          </span>
        </div>
        
        {event.priceFrom && (
          <div className="flex items-center gap-2">
            <span className="text-brand-navy/60">Price:</span>
            <span className="font-medium text-brand-navy">
              {event.free ? 'Free' : `From $${event.priceFrom}`}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-brand-navy/60">Source:</span>
          <span className="text-brand-navy">{event.source}</span>
        </div>
      </div>

      {/* Description */}
      {event.descriptionShort && (
        <p className="text-brand-navy/70 text-sm leading-relaxed">
          {event.descriptionShort}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onEdit(event)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};