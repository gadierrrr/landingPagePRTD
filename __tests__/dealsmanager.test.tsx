import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminPage from '../pages/admin';
import { dealSchema } from '../src/lib/forms';

// Mock next/router for AdminPage
jest.mock('next/router', () => ({
  useRouter() {
    return {
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

describe('AdminPage (Deals tab via central dashboard)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows admin login when not authenticated', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 401 })
    ) as jest.Mock;

    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Admin Login');
    });
  });

  test('renders dashboard when authenticated', async () => {
    // Return OK for the auth check and for stats fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ beaches: 0, deals: 0, events: 0, posts: 0 })
      })
    ) as jest.Mock;

    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
    });
  });
});

describe('Deal Schema', () => {
  test('validates required fields', () => {
    const validDeal = {
      title: 'Test Deal',
      description: 'Test description',
      amountLabel: '20% off',
      location: 'San Juan',
      image: '/images/test.png',
      category: 'restaurant' as const,
      expiry: '',
      partner: ''
    };

    const result = dealSchema.omit({ id: true }).safeParse(validDeal);
    expect(result.success).toBe(true);
  });

  test('rejects invalid category', () => {
    const invalidDeal = {
      title: 'Test Deal',
      description: 'Test description',
      amountLabel: '20% off',
      location: 'San Juan',
      image: '/images/test.png',
      category: 'invalid',
      expiry: '',
      partner: ''
    };

    const result = dealSchema.omit({ id: true }).safeParse(invalidDeal);
    expect(result.success).toBe(false);
  });

  test('rejects image not starting with /images/', () => {
    const invalidDeal = {
      title: 'Test Deal',
      description: 'Test description',
      amountLabel: '20% off',
      location: 'San Juan',
      image: 'invalid-path.png',
      category: 'restaurant' as const,
      expiry: '',
      partner: ''
    };

    const result = dealSchema.omit({ id: true }).safeParse(invalidDeal);
    expect(result.success).toBe(false);
  });
});
