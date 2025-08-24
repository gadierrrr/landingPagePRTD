import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Deals from '../pages/deals';

// Mock fetch for public deals page
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        id: "test-1",
        slug: "beach-resort-weekend",
        title: "Beach Resort Weekend",
        description: "Escape to paradise",
        amountLabel: "30% off",
        location: "San Juan",
        image: "/images/mock-deal-1.png",
        category: "hotel",
        expiry: "",
        partner: "Paradise Resort",
        updatedAt: new Date().toISOString()
      },
      {
        id: "test-2",
        slug: "rainforest-adventure",
        title: "Rainforest Adventure",
        description: "Explore the rainforest",
        amountLabel: "$25 off",
        location: "El Yunque",
        image: "/images/mock-deal-2.png",
        category: "tour",
        expiry: "",
        partner: "Adventure Tours",
        updatedAt: new Date().toISOString()
      }
    ])
  })
) as jest.Mock;

describe('Public Deals Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders page heading', () => {
    render(<Deals />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Deals');
  });

  test('renders deal titles from API', async () => {
    render(<Deals />);
    await waitFor(() => {
      expect(screen.getByText('Beach Resort Weekend')).toBeInTheDocument();
      expect(screen.getByText('Rainforest Adventure')).toBeInTheDocument();
    });
  });

  test('does not render management controls', async () => {
    render(<Deals />);
    await waitFor(() => {
      expect(screen.queryByText('Add New Deal')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });
});