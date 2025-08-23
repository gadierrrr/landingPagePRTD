import { render, screen } from '@testing-library/react';
import DealPage from '../pages/deal/[slug]';
import { Deal } from '../src/lib/forms';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/deal/[slug]',
      pathname: '/deal/[slug]',
      query: { slug: 'test-deal' },
      asPath: '/deal/test-deal',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  },
}));

const mockDeal: Deal = {
  id: 'test-id',
  slug: 'test-deal',
  title: 'Test Deal',
  description: 'This is a test deal description',
  amountLabel: '20% off',
  location: 'Test Location',
  image: '/images/test-deal.png',
  category: 'restaurant',
  partner: 'Test Partner',
  externalUrl: 'https://example.com/book',
  gallery: ['/images/test-deal.png'],
  fullDescription: 'This is a detailed description of the test deal',
  highlights: ['Great food', 'Amazing service', 'Beautiful location'],
  terms: 'Terms and conditions apply',
  price: 80,
  originalPrice: 100,
  currency: 'USD'
};

describe('Deal Detail Page', () => {
  it('renders deal title and basic info', () => {
    render(<DealPage deal={mockDeal} relatedDeals={[]} />);
    
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('20% off')).toBeInTheDocument();
    expect(screen.getByText('Test Partner')).toBeInTheDocument();
  });

  it('renders full description', () => {
    render(<DealPage deal={mockDeal} relatedDeals={[]} />);
    
    expect(screen.getByText('This is a detailed description of the test deal')).toBeInTheDocument();
  });

  it('renders highlights as list', () => {
    render(<DealPage deal={mockDeal} relatedDeals={[]} />);
    
    expect(screen.getByText('Great food')).toBeInTheDocument();
    expect(screen.getByText('Amazing service')).toBeInTheDocument();
    expect(screen.getByText('Beautiful location')).toBeInTheDocument();
  });

  it('renders pricing information', () => {
    render(<DealPage deal={mockDeal} relatedDeals={[]} />);
    
    expect(screen.getByText('$80')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('renders CTA button for non-expired deals', () => {
    render(<DealPage deal={mockDeal} relatedDeals={[]} />);
    
    expect(screen.getByRole('button', { name: /get this deal/i })).toBeInTheDocument();
  });

  it('shows expired state for expired deals', () => {
    const expiredDeal = {
      ...mockDeal,
      expiresAt: '2020-01-01T00:00:00.000Z' // Past date
    };
    
    render(<DealPage deal={expiredDeal} relatedDeals={[]} />);
    
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('This deal has expired')).toBeInTheDocument();
  });

  it('renders terms and conditions', () => {
    render(<DealPage deal={mockDeal} relatedDeals={[]} />);
    
    expect(screen.getByText('Terms and conditions apply')).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', () => {
    render(<DealPage deal={mockDeal} relatedDeals={[]} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
  });

  it('renders related deals when provided', () => {
    const relatedDeal: Deal = {
      id: 'related-id',
      slug: 'related-deal',
      title: 'Related Deal',
      description: 'Related description',
      amountLabel: '15% off',
      location: 'Related Location',
      image: '/images/related.png',
      category: 'restaurant',
      currency: 'USD'
    };
    
    render(<DealPage deal={mockDeal} relatedDeals={[relatedDeal]} />);
    
    expect(screen.getByText('Similar Deals')).toBeInTheDocument();
    expect(screen.getByText('Related Deal')).toBeInTheDocument();
  });
});