import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';

export default function DealsManagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=deals');
  }, [router]);

  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/admin?tab=deals',
    permanent: false
  }
});
