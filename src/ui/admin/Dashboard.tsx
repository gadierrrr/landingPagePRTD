import React from 'react';
import { useRouter } from 'next/router';
import { Heading } from '../Heading';
import { Button } from '../Button';
import { StatsCard } from './StatsCard';
import { useAdminStats } from './AdminStatsContext';

export function Dashboard() {
  const router = useRouter();
  const { stats, isLoading, error, refresh } = useAdminStats();

  const navigateToTab = (tab: string) => {
    router.push(`/admin?tab=${tab}`);
  };

  const resolvedStats = stats ?? {
    beaches: 0,
    deals: 0,
    events: 0,
    posts: 0
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-brand-navy">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading level={1} className="mb-2">
            Dashboard
          </Heading>
          <p className="max-w-2xl text-brand-navy/70">
            Welcome to the PRTD admin dashboard. Manage your beaches, deals, events, and blog posts from a single place.
          </p>
        </div>
        <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
          🔄 Refresh Stats
        </Button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button type="button" className="underline" onClick={() => refresh()}>
            Try again
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Beaches"
          count={resolvedStats.beaches}
          icon="🏖️"
          color="blue"
          onClick={() => navigateToTab('beaches')}
        />
        <StatsCard
          title="Deals"
          count={resolvedStats.deals}
          icon="💰"
          color="green"
          onClick={() => navigateToTab('deals')}
        />
        <StatsCard
          title="Events"
          count={resolvedStats.events}
          icon="🎉"
          color="purple"
          onClick={() => navigateToTab('events')}
        />
        <StatsCard
          title="Blog Posts"
          count={resolvedStats.posts}
          icon="📝"
          color="orange"
          onClick={() => navigateToTab('blog')}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-brand-navy/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigateToTab('beaches')}>
            🏖️ Manage Beaches
          </Button>
          <Button onClick={() => navigateToTab('deals')} variant="outline">
            💰 Manage Deals
          </Button>
          <Button onClick={() => navigateToTab('events')} variant="outline">
            🎉 Manage Events
          </Button>
          <Button onClick={() => navigateToTab('blog')} variant="outline">
            📝 Manage Blog
          </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-lg border border-brand-navy/10 bg-brand-sand/20 p-6">
        <h2 className="mb-3 text-lg font-semibold text-brand-navy">ℹ️ System Information</h2>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="font-medium text-brand-navy">Data Source:</span>{' '}
            <span className="text-brand-navy/70">SQLite Database</span>
          </div>
          <div>
            <span className="font-medium text-brand-navy">Database Location:</span>{' '}
            <span className="font-mono text-xs text-brand-navy/70">./data/prtd.sqlite</span>
          </div>
          <div>
            <span className="font-medium text-brand-navy">Version:</span>{' '}
            <span className="text-brand-navy/70">2.0.0</span>
          </div>
          <div>
            <span className="font-medium text-brand-navy">Environment:</span>{' '}
            <span className="text-brand-navy/70">
              {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
