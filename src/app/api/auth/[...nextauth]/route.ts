import NextAuth, { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
    providers: [
        {
            id: 'wca',
            name: 'World Cube Association',
            type: 'oauth',
            version: '2.0',
            authorization:
            {
                url: `${process.env.WCA_URL}/oauth/authorize`,
                params: 
                {
                    scope: 'public manage_competitions email dob',
                    response_type: 'code',
                },
            },
            token:
            {
                url: `${process.env.WCA_URL}/oauth/token`
            },
            userinfo: 
            {
                url: `${process.env.WCA_URL}/api/v0/me`,
            },
            clientId: process.env.WCA_CLIENT_ID!,
            clientSecret: process.env.WCA_CLIENT_SECRET!,

            idToken: false,
            checks: ['pkce', 'state'],

            profile(profile) 
            {
                return {
                    id: profile.me.id,
                    name: profile.me.name,
                    email: profile.me.email,
                    image: profile.me.avatar.thumb_url
                }
            },
        }
    ],

    callbacks: {
        async jwt({ token, account }) {
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }

            return token
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            return session;
        },
    },

    session: 
    {
        strategy: 'jwt',
    },

    debug: true,
}

const handler = NextAuth(authOptions);

export const auth = handler.auth;
export { handler as GET, handler as POST };