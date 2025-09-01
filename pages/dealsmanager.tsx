import React, { useState, useEffect } from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { Button } from '../src/ui/Button';
import { SEO } from '../src/ui/SEO';
import { DealsManager } from '../src/ui/deals/DealsManager';

export default function Deals() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch {
      // Auth check failed
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setError('Invalid token');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <SEO title="Manage Deals" />
        <Section>
          <div className="text-center">Loading...</div>
        </Section>
      </SiteLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <SEO title="Manage Deals" />
        <Section>
          <div className="mx-auto max-w-md">
            <Heading level={1}>Deals Manager</Heading>
            <div className="mt-6 space-y-4">
              <input
                type="password"
                placeholder="Admin token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                onKeyDown={(e) => e.key === 'Enter' && authenticate()}
              />
              <Button 
                onClick={authenticate} 
                disabled={isLoading || !token}
                className="w-full"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </Button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </Section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SEO 
        title="Manage Deals"
        description="Add, edit, and delete simple deal cards."
      />
      <Section>
        <Heading level={1}>Manage Deals</Heading>
        <div className="mt-6">
          <DealsManager />
        </div>
      </Section>
    </SiteLayout>
  );
}
