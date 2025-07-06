// src/lib/authOptions.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthOptions, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          let data = await res.json();

          console.log('🔐 Auth Login Response:', data);

          if (!res.ok || !data.access_token) {
            console.error('❌ Login failed', res.status, data);
            return null;
          }
          if (!res.ok) return null;
           data = await res.json();
          if (!data.access_token) return null;
      
          return {
            id: data.userId || data.id,
            email: data.email,
            quota: data.quota ?? 0,
            provider: 'credentials',
            name: data.name ?? null,
            picture: data.picture ?? null,
            accessToken: data.access_token,
          } as User;
        },
      }),      
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // For Google OAuth, send token to your NestJS backend
      if (account?.provider === 'google' && account.id_token) {
        // console.log('Google OAuth token:amazinggg', account.id_token);
        const res = await fetch(`${process.env.API_BASE_URL}/auth/oauth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: account.id_token }),
        });

        const data = await res.json();
        console.log('Google OAuth response:amazinggg', data);



        if (!data.accessToken) {
            console.warn('[Google Auth] Missing accessToken in backend response!');
        }

        token.accessToken = data.accessToken;
        token.user = {
            id: data.user.id,
            email: data.user.email,
            quota: data.user.quota ?? 0,
            provider: 'google',
            name: data.user.name ?? null,
            picture: data.user.picture ?? null,
          };

          console.log('Final token.user →', token.user , token.accessToken);

      }

      // For credentials login
      else if (user) {
        token.accessToken = user.accessToken;
        token.user = {
          id: user.id,
          email: user.email,
          quota: user.quota ?? 0,
          provider: 'credentials',
          name: user.name ?? null,
          picture: user.picture ?? null,
        };
      }
      

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = token.user as {
        id: string;
        email: string;
        quota: number;
        provider: string | null;
        name: string | null;
        picture: string | null;
      };
      
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
