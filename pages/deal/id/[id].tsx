import { GetServerSideProps } from 'next';
import { getDealById } from '../../../src/lib/dealsStore';

// This page provides redirect from old ID-based URLs to new slug-based URLs
// Access via /deal/id/[uuid] to avoid conflicts with slug routing
export default function DealIdRedirect() {
  // This component should never render as we redirect server-side
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  
  // Check if this looks like a UUID (old ID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return {
      notFound: true
    };
  }
  
  try {
    const deal = await getDealById(id);
    
    if (!deal || !deal.slug) {
      return {
        notFound: true
      };
    }
    
    // 301 redirect to the canonical slug URL
    return {
      redirect: {
        destination: `/deal/${deal.slug}`,
        permanent: true
      }
    };
  } catch (error) {
    console.error('Error looking up deal for redirect:', error);
    return {
      notFound: true
    };
  }
};