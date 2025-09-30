import { render, screen } from '@testing-library/react';
import Landing from '../pages/index';

// Mock data for testing
const mockDeal = {
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
};

const mockGuide = {
  id: 'test-guide-1',
  title: 'Test Guide',
  excerpt: 'Test guide excerpt',
  slug: 'test-guide',
  tags: ['travel'],
  publishDate: '2023-01-01T00:00:00.000Z'
};

const defaultProps = {
  featuredDeal: null,
  latestDeals: [],
  under50Deals: [],
  guides: [],
  heroBackgrounds: ['/test-bg.jpg']
};

describe('Landing page', () => {
  it('renders hero heading', () => {
    render(<Landing {...defaultProps} />);
    expect(screen.getByText(/made fun/i)).toBeInTheDocument();
  });

  it('renders deals section when deals are provided', () => {
    render(<Landing {...defaultProps} latestDeals={[mockDeal]} />);
    expect(screen.getByText('This Week\'s Steals')).toBeInTheDocument();
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
  });

  it('shows fallback when no deals are provided', () => {
    render(<Landing {...defaultProps} />);
    expect(screen.getByText('New deals coming soon!')).toBeInTheDocument();
  });

  it('renders featured deal when provided', () => {
    render(<Landing {...defaultProps} featuredDeal={mockDeal} />);
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
  });

  it('renders guides section when guides are provided', () => {
    render(<Landing {...defaultProps} guides={[mockGuide]} />);
    expect(screen.getByText('Need inspiration?')).toBeInTheDocument();
    expect(screen.getByText('Test Guide')).toBeInTheDocument();
  });
});
