import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Button } from '../Button';
import { Heading } from '../Heading';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading, error, token, setToken, authenticate } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticate(token);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-brand-navy">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-sand/30">
        <div className="w-full max-w-md rounded-lg border border-brand-navy/10 bg-white p-8 shadow-lg">
          <Heading level={1} className="mb-6 text-center">
            Admin Login
          </Heading>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="mb-2 block text-sm font-medium text-brand-navy">
                Admin Token
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded border border-brand-navy/20 px-4 py-2 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                placeholder="Enter your admin token"
                autoComplete="current-password"
                autoFocus
              />
            </div>
            {error && (
              <div className="rounded bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={!token.trim()}
            >
              Sign In
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-brand-navy/60">
            Access restricted to administrators only
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
