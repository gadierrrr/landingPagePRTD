import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminStatsProvider, useAdminStats, AdminStats } from './AdminStatsContext';
import { TabNavigation, TabNavItem } from './TabNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

interface BaseNavItem {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  statKey?: keyof AdminStats;
}

const BASE_NAV_ITEMS: BaseNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', shortcut: '0' },
  { id: 'beaches', label: 'Beaches', icon: '🏖️', shortcut: '1', statKey: 'beaches' },
  { id: 'deals', label: 'Deals', icon: '💰', shortcut: '2', statKey: 'deals' },
  { id: 'events', label: 'Events', icon: '🎉', shortcut: '3', statKey: 'events' },
  { id: 'blog', label: 'Blog', icon: '📝', shortcut: '4', statKey: 'posts' }
];

export function AdminLayout({ children, activeTab = 'dashboard' }: AdminLayoutProps) {
  return (
    <AdminStatsProvider>
      <AdminLayoutShell activeTab={activeTab}>{children}</AdminLayoutShell>
    </AdminStatsProvider>
  );
}

function AdminLayoutShell({ children, activeTab }: { children: React.ReactNode; activeTab: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAdminAuth();
  const router = useRouter();
  const { stats } = useAdminStats();

  const navItems = useMemo<TabNavItem[]>(
    () =>
      BASE_NAV_ITEMS.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        shortcut: item.shortcut,
        count:
          item.statKey && stats
            ? stats[item.statKey]
            : item.statKey
            ? undefined
            : undefined
      })),
    [stats]
  );

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleNavClick = (tabId: string) => {
    router.push(`/admin?tab=${tabId}`);
  };

  useEffect(() => {
    const shortcutMap = new Map<string, string>();
    BASE_NAV_ITEMS.forEach((item) => {
      if (item.shortcut) {
        shortcutMap.set(item.shortcut, item.id);
      }
    });

    const isInteractiveElement = (target: EventTarget | null): target is HTMLElement => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tagName = target.tagName;
      return (
        target.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        tagName === 'BUTTON'
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (isInteractiveElement(event.target)) return;

      const tabId = shortcutMap.get(event.key);
      if (tabId) {
        event.preventDefault();
        router.push(`/admin?tab=${tabId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const breadcrumbLabel = useMemo(
    () => BASE_NAV_ITEMS.find((item) => item.id === activeTab)?.label,
    [activeTab]
  );

  return (
    <div className="flex min-h-screen bg-brand-sand/20">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } border-brand-navy/10 flex flex-col border-r bg-white transition-all duration-300`}
      >
        {/* Header */}
        <div className="border-brand-navy/10 flex items-center justify-between border-b p-4">
          {isSidebarOpen ? (
            <h1 className="text-lg font-bold text-brand-navy">PRTD Admin</h1>
          ) : (
            <span className="text-2xl">⚙️</span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-brand-navy/60 hover:text-brand-navy"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-brand-blue text-white'
                    : 'text-brand-navy hover:bg-brand-sand/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {typeof item.count === 'number' && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-brand-navy/10 text-brand-navy/70'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-brand-navy/10 border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-brand-navy hover:bg-brand-red/10 hover:text-brand-red"
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-brand-navy/60">
            <Link href="/" className="hover:text-brand-navy">
              Home
            </Link>
            <span>›</span>
            <Link href="/admin" className="hover:text-brand-navy">
              Admin
            </Link>
            {activeTab !== 'dashboard' && breadcrumbLabel && (
              <>
                <span>›</span>
                <span className="text-brand-navy">{breadcrumbLabel}</span>
              </>
            )}
          </div>

          <TabNavigation items={navItems} activeTab={activeTab} onTabSelect={handleNavClick} />

          {/* Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
