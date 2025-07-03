// components/GoogleOAuthButton.tsx
'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from './ui/button';

export const GoogleOAuthButton = () => {
  return (
    <Button
      variant="outline"
      onClick={() => signIn('google',{ callbackUrl: '/dashboard' })}
      className="w-full flex items-center justify-center gap-2 border rounded-lg"
    >
      <FcGoogle className="text-xl" />
      Continue with Google
    </Button>
  );
};
