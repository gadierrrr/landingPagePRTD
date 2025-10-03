import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';

export default function BlogManagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=blog');
  }, [router]);

  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/admin?tab=blog',
    permanent: false
  }
});
