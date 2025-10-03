import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';

export default function BeachesManagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=beaches');
  }, [router]);

  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/admin?tab=beaches',
    permanent: false
  }
});
