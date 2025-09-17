import { render, screen, fireEvent } from '@testing-library/react';
import Landing from '../pages/landing';

// Mock deals for testing
const mockDeals = [
  {
    id: 'test-1',
    slug: 'test-deal',
    title: 'Test Deal',
    description: 'Test Description',
    amountLabel: '50% OFF',
    location: 'Test Location',
    image: '/test-image.jpg',
    category: 'hotel' as const,
    updatedAt: '2023-01-01T00:00:00.000Z',
    gallery: ['/test-image.jpg'],
    fullDescription: 'Full description',
    highlights: [],
    terms: '',
    currency: 'USD' as const
  }
];

describe('Landing page', () => {
  it('renders hero heading', () => {
    render(<Landing featuredDeals={[]} />);
    expect(screen.getByText('Puerto Rico travel deals, updated daily.')).toBeInTheDocument();
  });

  it('renders deals section when deals are provided', () => {
    render(<Landing featuredDeals={mockDeals} />);
    expect(screen.getByText('Latest Deals')).toBeInTheDocument();
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
  });

  it('shows fallback when no deals are provided', () => {
    render(<Landing featuredDeals={[]} />);
    expect(screen.getByText('New deals coming soon!')).toBeInTheDocument();
  });
});
