import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AdminAuthGuard } from '../src/ui/admin/AdminAuthGuard';
import { AdminLayout } from '../src/ui/admin/AdminLayout';
import { Dashboard } from '../src/ui/admin/Dashboard';
import { BeachesSection } from '../src/ui/admin/sections/BeachesSection';
import { DealsSection } from '../src/ui/admin/sections/DealsSection';
import { EventsSection } from '../src/ui/admin/sections/EventsSection';
import { BlogSection } from '../src/ui/admin/sections/BlogSection';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { verifyAdminCookie } from '../src/lib/admin/auth';
import { generateCSRFToken } from '../src/lib/csrf';
import crypto from 'crypto';

const VALID_TABS = ['dashboard', 'beaches', 'deals', 'events', 'blog'] as const;
type Tab = typeof VALID_TABS[number];

function isValidTab(value: string): value is Tab {
  return (VALID_TABS as readonly string[]).includes(value);
}

export default function AdminPage() {
  const router = useRouter();

  const activeTab = useMemo<Tab>(() => {
    const queryTab = router.query.tab;
    if (typeof queryTab === 'string' && isValidTab(queryTab)) {
      return queryTab;
    }
    return 'dashboard';
  }, [router.query.tab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'beaches':
        return <BeachesSection />;
      case 'deals':
        return <DealsSection />;
      case 'events':
        return <EventsSection />;
      case 'blog':
        return <BlogSection />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminAuthGuard>
      <AdminLayout activeTab={activeTab}>{renderContent()}</AdminLayout>
    </AdminAuthGuard>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { req, res } = ctx;

  // Minimal cookie parser for SSR
  const rawCookie = req.headers.cookie || '';
  const cookies: Record<string, string> = Object.fromEntries(
    rawCookie.split(';').map((c) => {
      const idx = c.indexOf('=');
      const key = decodeURIComponent(c.slice(0, idx).trim());
      const val = decodeURIComponent(c.slice(idx + 1).trim());
      return [key, val];
    }).filter(([k]) => k)
  );

  const adminCookie = cookies['admin_auth'];
  if (adminCookie && verifyAdminCookie(adminCookie)) {
    const sessionId = crypto.createHash('sha256').update(adminCookie).digest('hex').substring(0, 16);
    const csrfToken = generateCSRFToken(sessionId);
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader(
      'Set-Cookie',
      `csrf_token=${csrfToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${isProduction ? '; Secure' : ''}`
    );
  }

  return { props: {} };
};
