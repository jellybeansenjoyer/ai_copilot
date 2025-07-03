'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin');
  }, [loading, user, router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <p>Quota Remaining: {user.quota}</p>
      <button onClick={signOut} className="mt-4 text-red-500">Sign Out</button>
    </div>
  );
}