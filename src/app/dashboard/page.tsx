'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('DashboardPage user:', user);
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
// 'use client';

// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

// export default function DashboardPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//     console.log(`${JSON.stringify(session)} ${status} asd`);
//   if (status === 'unauthenticated') router.push('/auth/signin');

//   return (
//     <div>
//       Welcome {session?.user?.email}
//     </div>
//   );
// }
