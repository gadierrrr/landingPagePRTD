import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AdminAuthGuard } from '../src/ui/admin/AdminAuthGuard';
import { AdminLayout } from '../src/ui/admin/AdminLayout';
import { Dashboard } from '../src/ui/admin/Dashboard';
import { BeachesSection } from '../src/ui/admin/sections/BeachesSection';
import { DealsSection } from '../src/ui/admin/sections/DealsSection';
import { EventsSection } from '../src/ui/admin/sections/EventsSection';
import { BlogSection } from '../src/ui/admin/sections/BlogSection';
import type { GetServerSideProps } from 'next';
import { verifyAdminCookie } from '../src/lib/admin/auth';
import { generateCSRFToken, getSessionId, setCSRFCookie } from '../src/lib/csrf';

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

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  // Server-side check: if authenticated, ensure a fresh CSRF token cookie
  const adminCookie = (req as any).cookies?.admin_auth as string | undefined;
  if (adminCookie && verifyAdminCookie(adminCookie)) {
    const sessionId = getSessionId(req as any);
    const csrfToken = generateCSRFToken(sessionId);
    setCSRFCookie(res as any, csrfToken);
  }

  return { props: {} };
};
