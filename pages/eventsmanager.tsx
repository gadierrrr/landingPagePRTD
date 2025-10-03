import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';

export default function EventsManagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=events');
  }, [router]);

  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/admin?tab=events',
    permanent: false
  }
});
