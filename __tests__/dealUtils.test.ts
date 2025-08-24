import { isExpired, displaySourceName, appendUtm, formatRelativeTime, formatEndDate } from '../src/lib/dealUtils';

describe('dealUtils', () => {
  describe('isExpired', () => {
    it('returns false for undefined or empty string', () => {
      expect(isExpired()).toBe(false);
      expect(isExpired('')).toBe(false);
    });

    it('returns true for dates in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isExpired(pastDate.toISOString())).toBe(true);
    });

    it('returns false for dates in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isExpired(futureDate.toISOString())).toBe(false);
    });

    it('returns false for invalid date strings', () => {
      expect(isExpired('invalid-date')).toBe(false);
    });
  });

  describe('displaySourceName', () => {
    it('returns sourceName when provided', () => {
      expect(displaySourceName('https://example.com', 'Custom Source')).toBe('Custom Source');
    });

    it('returns null when no URL or sourceName provided', () => {
      expect(displaySourceName()).toBe(null);
      expect(displaySourceName('')).toBe(null);
    });

    it('returns known source names for recognized domains', () => {
      expect(displaySourceName('https://groupon.com/deal/123')).toBe('Groupon');
      expect(displaySourceName('https://www.viator.com/tours')).toBe('Viator');
      expect(displaySourceName('https://booking.com/hotel')).toBe('Booking.com');
    });

    it('capitalizes unknown domains', () => {
      expect(displaySourceName('https://example.com/path')).toBe('Example.com');
      expect(displaySourceName('https://www.testsite.org')).toBe('Testsite.org');
    });

    it('handles invalid URLs gracefully', () => {
      expect(displaySourceName('not-a-url')).toBe(null);
    });
  });

  describe('appendUtm', () => {
    it('adds UTM parameters to URL without existing query params', () => {
      const result = appendUtm('https://example.com/path');
      const url = new URL(result);
      expect(url.searchParams.get('utm_source')).toBe('PRTD');
      expect(url.searchParams.get('utm_medium')).toBe('referral');
      expect(url.searchParams.get('utm_campaign')).toBe('deal_page');
    });

    it('preserves existing query parameters', () => {
      const result = appendUtm('https://example.com/path?existing=value');
      const url = new URL(result);
      expect(url.searchParams.get('existing')).toBe('value');
      expect(url.searchParams.get('utm_source')).toBe('PRTD');
    });

    it('overwrites existing UTM parameters', () => {
      const result = appendUtm('https://example.com/path?utm_source=old');
      const url = new URL(result);
      expect(url.searchParams.get('utm_source')).toBe('PRTD');
    });

    it('returns original URL if URL parsing fails', () => {
      expect(appendUtm('not-a-url')).toBe('not-a-url');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "today" for today\'s date', () => {
      const today = new Date().toISOString();
      expect(formatRelativeTime(today)).toBe('today');
    });

    it('returns "yesterday" for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatRelativeTime(yesterday.toISOString())).toBe('yesterday');
    });

    it('returns days ago for recent dates', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3 days ago');
    });

    it('returns "recently" for invalid dates', () => {
      expect(formatRelativeTime('invalid-date')).toBe('recently');
    });
  });

  describe('formatEndDate', () => {
    it('formats date in MMM d format', () => {
      const date = new Date('2024-12-25T12:00:00Z');
      const result = formatEndDate(date.toISOString());
      expect(result).toMatch(/Dec \d+/);
    });

    it('returns empty string for invalid dates', () => {
      expect(formatEndDate('invalid-date')).toBe('');
    });
  });
});