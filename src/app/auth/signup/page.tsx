'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GoogleOAuthButton } from '@/components/GoogleOAuthButton';
import { signIn } from 'next-auth/react';
import ProfileDialog from '@/components/ProfileDialog'; // adjust if needed
const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
    
export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const onSubmitToSignIn = async (data: any) => {
    const res = await signIn('credentials', {
      redirect: false,
      ...data,
    });

    if (res?.ok){
      setUserEmail(data.email);
      setOpen(true)
      // router.push('/dashboard');
      // console.log('Authentication successful:', res);
    } 
    else console.log('Authentication failed:', res?.error);
    // else alert('Authentication failed');

  };
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await fetch(`https://ai-copilot-backend.onrender.com/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      onSubmitToSignIn(data)
      // router.push('/auth/signin');
    } catch (err) {
      console.error('Signup failed', err);
    }
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

        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-500 mb-6">Enter your details to register</p>

          <GoogleOAuthButton />
          
                    {/* Divider */}
                    <div className="flex items-center my-6">
                      <div className="flex-grow h-px bg-gray-200" />
                      <span className="mx-4 text-gray-500 text-sm">or</span>
                      <div className="flex-grow h-px bg-gray-200" />
                    </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <Input placeholder="Enter your email" {...register('email')} className="rounded-lg" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <Input type="password" placeholder="••••••••" {...register('password')} className="rounded-lg" />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Confirm Password</label>
              <Input type="password" placeholder="••••••••" {...register('confirmPassword')} className="rounded-lg" />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-[#8a7cc7] hover:bg-[#7a6bb6] text-white rounded-lg" disabled={loading}>
              {loading ? 'Registering...' : 'Create Account'}
            </Button>

            <p className="text-sm text-center mt-4">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-bold text-black">Log In</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Panel - Video Background */}
      {open && <ProfileDialog email={userEmail} onClose={() => setOpen(false)} />}
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
