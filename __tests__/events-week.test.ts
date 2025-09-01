import { getWeekStartDate } from '../src/lib/eventsStore';

describe('Week bucketing', () => {
  test('September 2nd event should be in September 1st week', () => {
    const eventDate = new Date('2025-09-02T03:00:00.000Z');
    const weekStart = getWeekStartDate(eventDate);
    expect(weekStart).toBe('2025-09-01');
  });

  test('September 8th event should be in September 8th week', () => {
    const eventDate = new Date('2025-09-08T00:00:00.000Z');
    const weekStart = getWeekStartDate(eventDate);
    expect(weekStart).toBe('2025-09-08');
  });
});