import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' 
{
    interface Session 
    {
        error?: 'RefreshAccessTokenError'
        accessToken?: string;
        user: 
        {
            id: number;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT 
    {
        accessToken?: string;
        refreshToken: string;
        expiresAt: number;
        error?: 'RefreshAccessTokenError';
    }
}