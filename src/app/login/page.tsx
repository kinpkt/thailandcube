'use client';

import { signIn } from 'next-auth/react';

const Page = () => 
{
    return (
        <button onClick={() => signIn('wca')}>
            Sign in with WCA
        </button>
    );
}

export default Page;