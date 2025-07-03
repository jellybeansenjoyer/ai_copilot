// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    accessToken: string;
  }

  interface Session extends DefaultSession {
    accessToken: string;
  }
}
