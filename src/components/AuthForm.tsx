'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  console.log('AuthForm modess:', mode);
  const onSubmit = async (data: any) => {
    setLoading(true);
    console.log('Submitting data:', mode);
    if (mode === 'signup') {
      const res = await fetch(`http://localhost:2999/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
        if (!res.ok) {
            alert('Sign up failed');
            setLoading(false);
            return;
        }
    }

    const res = await signIn('credentials', {
      redirect: false,
      ...data,
    });

    if (res?.ok) router.push('/dashboard');
    else alert('Authentication failed');

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Email" {...register('email')} />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

      <Input placeholder="Password" type="password" {...register('password')} />
      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
      </Button>
    </form>
  );
}
