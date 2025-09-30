import { Event } from './forms';

export function isEventExpired(event: Event): boolean {
  const now = new Date();
  const eventEnd = event.endDateTime ? new Date(event.endDateTime) : new Date(event.startDateTime);
  return eventEnd < now;
}

export function isEventCanceled(event: Event): boolean {
  return event.status === 'canceled' || event.status === 'postponed';
}

export function formatEventDate(startDateTime: string, endDateTime?: string): string {
  // Use try-catch to handle potential Intl issues during SSR
  try {
    const start = new Date(startDateTime);
    const startDate = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Puerto_Rico'
    });
    const startTime = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Puerto_Rico'
    });

    if (endDateTime) {
      const end = new Date(endDateTime);
      const endTime = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Puerto_Rico'
      });

      // Same day
      if (start.toDateString() === end.toDateString()) {
        return `${startDate}, ${startTime} - ${endTime}`;
      } else {
        const endDate = end.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'America/Puerto_Rico'
        });
        return `${startDate} ${startTime} - ${endDate} ${endTime}`;
      }
    }

    return `${startDate}, ${startTime}`;
  } catch (e) {
    // Fallback for SSR or Intl issues
    return startDateTime;
  }
}

export function formatEventTime(startDateTime: string): string {
  const start = new Date(startDateTime);
  return start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Puerto_Rico'
  });
}

export function generateMapUrl(venueName?: string, address?: string, city?: string): string {
  const query = [venueName, address, city, 'Puerto Rico']
    .filter(Boolean)
    .join(', ');
  
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}

export function appendUtmToEventUrl(url: string, weekStart: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'prtd-events');
    urlObj.searchParams.set('utm_campaign', `weekly-events-${weekStart}`);
    urlObj.searchParams.set('utm_medium', 'web');
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

export function getEventStatusBadge(event: Event): { text: string; className: string } {
  if (event.status === 'canceled') {
    return { text: 'Canceled', className: 'bg-brand-red text-white' };
  }
  if (event.status === 'postponed') {
    return { text: 'Postponed', className: 'bg-warning text-white' };
  }
  if (event.status === 'sold_out') {
    return { text: 'Sold Out', className: 'bg-brand-navy text-white' };
  }
  if (isEventExpired(event)) {
    return { text: 'Past Event', className: 'bg-brand-navy/60 text-white' };
  }
  
  return { text: '', className: '' };
}

export function getGenreBadgeColor(genre: string): string {
  switch (genre) {
    case 'music': return 'bg-brand-blue/10 text-brand-blue';
    case 'food': return 'bg-brand-red/10 text-brand-red';
    case 'art': return 'bg-purple-100 text-purple-700';
    case 'sports': return 'bg-green-100 text-green-700';
    case 'family': return 'bg-brand-sand text-brand-navy';
    case 'nightlife': return 'bg-brand-navy/10 text-brand-navy';
    case 'culture': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}