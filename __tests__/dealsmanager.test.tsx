import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DealsManager from '../pages/dealsmanager';
import { dealSchema } from '../src/lib/forms';

// Mock fetch for DealsManager component
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
) as jest.Mock;

describe('DealsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders page title', () => {
    render(<DealsManager />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Manage Deals');
  });

  test('renders deals manager component', async () => {
    render(<DealsManager />);
    await waitFor(() => {
      expect(screen.getByText('Add New Deal')).toBeInTheDocument();
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