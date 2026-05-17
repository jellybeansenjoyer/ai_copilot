// src/components/ClientProviders.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
