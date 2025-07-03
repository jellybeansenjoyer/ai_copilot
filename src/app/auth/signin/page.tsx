'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { GoogleOAuthButton } from '@/components/GoogleOAuthButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function SignInPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      ...data,
    });

    if (res?.ok) router.push('/dashboard');
    else alert('Authentication failed');

    setLoading(false);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Panel */}
      <div className="w-1/2 bg-white px-12 py-8 flex flex-col justify-center relative">
        {/* Logo & Name */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="bg-[#8a7cc7] p-2 rounded-xl">
            <Image src="/icon.png" alt="Logo" width={32} height={32} />
          </div>
          <span className="font-semibold text-lg">Reimage</span>
        </div>

        {/* Heading */}
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-500 mb-6">Please enter your details</p>

          <GoogleOAuthButton />

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-4 text-gray-500 text-sm">or sign in with email</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          {/* Email & Password Fields */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <Input placeholder="Enter your email" className="rounded-lg" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <Input type="password" placeholder="••••••••" className="rounded-lg" {...register('password')} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Remember Me + Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <Checkbox id="remember" />
                <span>Remember me</span>
              </label>
              <Link href="#" className="text-[#8a7cc7]">Forgot password?</Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#8a7cc7] hover:bg-[#7a6bb6] text-white rounded-lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>

            {/* Redirect Link */}
            <p className="text-sm text-center mt-4">
              Don’t have an account?{' '}
              <Link href="/auth/signup" className="font-bold text-black">Register Now</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Panel - Video Background */}
      <div className="w-1/2 h-full overflow-hidden">
        <video
          className="object-cover w-full h-full"
          autoPlay
          muted
          loop
          playsInline
          src="/login-video.mp4"
        />
      </div>
    </div>
  );
}
