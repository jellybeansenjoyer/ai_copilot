'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getApiBaseUrl } from '@/lib/api';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AuthFormValues = z.infer<typeof formSchema>;

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await fetch(`${getApiBaseUrl()}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          alert('Sign up failed');
          return;
        }
      }

      const res = await signIn('credentials', {
        redirect: false,
        ...data,
      });

      if (res?.ok) router.push('/dashboard');
      else alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Email" disabled={loading} {...register('email')} />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

      <Input placeholder="Password" type="password" disabled={loading} {...register('password')} />
      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {loading
          ? mode === 'signup'
            ? 'Please wait…'
            : 'Signing in…'
          : mode === 'signup'
            ? 'Sign Up'
            : 'Sign In'}
      </Button>
    </form>
  );
}
