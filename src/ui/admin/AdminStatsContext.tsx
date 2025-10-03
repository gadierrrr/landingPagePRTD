import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

export interface AdminStats {
  beaches: number;
  deals: number;
  events: number;
  posts: number;
}

interface AdminStatsContextValue {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const AdminStatsContext = createContext<AdminStatsContextValue | undefined>(undefined);

export function AdminStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStats = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data: AdminStats = await response.json();

      if (!isMountedRef.current) return;

      setStats(data);
    } catch (err) {
      if (!isMountedRef.current) return;

      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      if (!isMountedRef.current) return;

      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const value = useMemo<AdminStatsContextValue>(
    () => ({ stats, isLoading, error, refresh: fetchStats }),
    [stats, isLoading, error, fetchStats]
  );

  return <AdminStatsContext.Provider value={value}>{children}</AdminStatsContext.Provider>;
}

export function useAdminStats() {
  const context = useContext(AdminStatsContext);
  if (!context) {
    throw new Error('useAdminStats must be used within an AdminStatsProvider');
  }
  return context;
}
