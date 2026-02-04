'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserRole } from '@/app/actions/users';
import { Spinner } from '@heroui/react';
import Dashboard from '@/app/components/Dashboard';
import { Role } from '@prisma/client';

const Page = () =>
{
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => 
    {
        if (status !== 'authenticated' || !session.user)
        {
            return;
        }

        const fetchRoleFromDB = async () =>
        {
            try
            {
                const role = await getUserRole(Number(session.user.id));

                setIsAdmin(role === Role.SUPERUSER || role === Role.ADMIN);
                setLoading(false);
            }
            catch (error)
            {
                throw error;
            }
        }

        fetchRoleFromDB();
    }, [status, session]);

    useEffect(() => 
    {
        if (!loading && !isAdmin)
            router.push('/');
    }, [loading, isAdmin, router]);


    if (loading) 
    {
        return (
            <div className='mx-auto flex justify-center mt-10'>
                <Spinner size='lg'/>
            </div>
        );
    }

    if (!isAdmin)
        return null; 

    return (
        <div className='mx-auto'>
            <Dashboard />
        </div>
    );
}

export default Page;