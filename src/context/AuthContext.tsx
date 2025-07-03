'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("session in AuthContext:", session);
    console.log("accessToken:", session?.accessToken);

    if (status === 'loading') return;
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }
    fetch('http://localhost:2999/user/profile', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then(res => res.json())
      .then(setUser)
      .catch(()=>{setUser(null)})
      .finally(() => setLoading(false));
  }, [session, status]);

  const signOut = () => {
    nextAuthSignOut({ redirect: false });
    setUser(null);
    router.push('/auth/signin');
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken: session?.accessToken ?? null, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
