'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  quota: number;
  provider: string | null;
  name: string | null;
  picture: string | null;
}

interface AuthContextProps {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  signOutPending: boolean;
  signOut: () => Promise<void>;
  /** Re-fetch profile from the API (e.g. after updating name/picture). Does not toggle full-page loading. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutPending, setSignOutPending] = useState(false);
  const router = useRouter();

  const accessToken = session?.accessToken ?? null;

  const loadProfile = useCallback(async (token: string, signal?: AbortSignal) => {
    const res = await fetch(`${getApiBaseUrl()}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
    if (!res.ok) {
      throw new Error('Profile request failed');
    }
    return (await res.json()) as UserProfile;
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadProfile(accessToken)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally NOT depending on `session` — NextAuth often gives a new object
    // reference on refetch/window focus, which would retrigger this effect in a loop.
  }, [status, accessToken, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await loadProfile(accessToken);
      setUser(data);
    } catch {
      // keep existing user on transient errors
    }
  }, [accessToken, loadProfile]);

  const signOut = useCallback(async () => {
    setSignOutPending(true);
    try {
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      router.push('/auth/signin');
    } finally {
      setSignOutPending(false);
    }
  }, [router]);

  const value = useMemo<AuthContextProps>(
    () => ({
      user,
      accessToken,
      loading,
      signOutPending,
      signOut,
      refreshProfile,
    }),
    [user, accessToken, loading, signOutPending, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
