// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      quota: number;
      provider: string | null;
      name: string | null;
      picture: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    quota: number;
    provider: string | null;
    name: string | null;
    picture: string | null;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    user: {
      id: string;
      email: string;
      quota: number;
      provider: string | null;
      name: string | null;
      picture: string | null;
    };
  }
}
