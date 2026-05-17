'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

type Props = {
  /** Disable while parent form is submitting */
  disabled?: boolean;
};

export const GoogleOAuthButton = ({ disabled = false }: Props) => {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } finally {
      setPending(false);
    }
  };

  const busy = pending || disabled;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 border rounded-lg"
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
      ) : (
        <FcGoogle className="text-xl" />
      )}
      {pending ? 'Connecting…' : 'Continue with Google'}
    </Button>
  );
};
