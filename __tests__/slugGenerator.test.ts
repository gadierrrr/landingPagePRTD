import { generateSlug, isValidSlug, sanitizeSlug } from '../src/lib/slugGenerator';

describe('slugGenerator', () => {
  describe('generateSlug', () => {
    it('generates basic slug from title', () => {
      const slug = generateSlug('Beach Resort Weekend');
      expect(slug).toBe('beach-resort-weekend');
    });

    it('handles special characters', () => {
      const slug = generateSlug('Café & Restaurant 50% Off!');
      expect(slug).toBe('caf-restaurant-50-off'); // Note: é becomes just the base char without accent
    });

    it('handles multiple spaces and hyphens', () => {
      const slug = generateSlug('  Multiple    Spaces  --  And   Hyphens  ');
      expect(slug).toBe('multiple-spaces-and-hyphens');
    });

    it('handles empty or invalid titles', () => {
      const slug = generateSlug('');
      expect(slug).toBe('deal');
    });

    it('handles collision with existing slugs', () => {
      const existingSlugs = ['beach-resort-weekend'];
      const slug = generateSlug('Beach Resort Weekend', existingSlugs);
      expect(slug).not.toBe('beach-resort-weekend');
      expect(slug).toMatch(/^beach-resort-weekend-[a-z0-9]{6}$/);
    });

    it('handles multiple collisions', () => {
      const existingSlugs = ['deal', 'deal-abc123', 'deal-def456'];
      const slug = generateSlug('', existingSlugs);
      expect(slug).not.toBe('deal');
      expect(slug).toMatch(/^deal-[a-z0-9]{6}$/);
    });
  });

  describe('isValidSlug', () => {
    it('validates correct slugs', () => {
      expect(isValidSlug('beach-resort-weekend')).toBe(true);
      expect(isValidSlug('simple')).toBe(true);
      expect(isValidSlug('deal-123')).toBe(true);
    });

    it('rejects invalid slugs', () => {
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug('has spaces')).toBe(false);
      expect(isValidSlug('has_underscore')).toBe(false);
      expect(isValidSlug('has.period')).toBe(false);
      expect(isValidSlug('-starts-with-hyphen')).toBe(false);
      expect(isValidSlug('ends-with-hyphen-')).toBe(false);
      expect(isValidSlug('UPPERCASE')).toBe(false);
    });
  });

  describe('sanitizeSlug', () => {
    it('sanitizes input to valid slug format', () => {
      expect(sanitizeSlug('Beach Resort Weekend')).toBe('beach-resort-weekend');
      expect(sanitizeSlug('  Extra   Spaces  ')).toBe('extra-spaces');
      expect(sanitizeSlug('Special@#$%Characters')).toBe('specialcharacters');
    });

    it('limits length', () => {
      const longTitle = 'a'.repeat(150);
      const sanitized = sanitizeSlug(longTitle);
      expect(sanitized.length).toBeLessThanOrEqual(100);
    });
  });
});