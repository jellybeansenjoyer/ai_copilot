'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from './ui/button';

export const GoogleOAuthButton = () => {
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/editor' });
  };

  return (
    <Button
      variant="outline"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 border rounded-lg"
    >
      <FcGoogle className="text-xl" />
      Continue with Google
    </Button>
  );
};
