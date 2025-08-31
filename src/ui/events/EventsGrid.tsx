import React from 'react';
import { Event } from '../../lib/forms';
import { EventCard } from './EventCard';

interface EventsGridProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventsGrid: React.FC<EventsGridProps> = ({ events, onEdit, onDelete }) => {
  if (events.length === 0) {
    return (
      <div className="bg-brand-sand/50 border-brand-navy/10 rounded-lg border px-6 py-8 text-center">
        <p className="text-brand-navy/70">No events for this week yet.</p>
        <p className="text-brand-navy/50 mt-1 text-sm">Click "Add New Event" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};