import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Custom404 from './404';

export const getServerSideProps: GetServerSideProps = async ({ res }: GetServerSidePropsContext) => {
  res.statusCode = 404;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  return {
    props: {},
  };
};

export default function LegacyNotFound() {
  return <Custom404 />;
}
