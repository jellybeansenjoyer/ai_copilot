// app/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin'); // Unauthenticated → go to login
  }

  redirect('/dashboard'); // Authenticated → go to dashboard
}
