'use client';

import { Card, CardBody, Avatar } from '@heroui/react';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import axios from 'axios';
import { User } from '@/model/User';

const Profile = () =>
{
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { data: session, status } = useSession();

    console.log(session);

    useEffect(() => 
    {
        if (status !== 'authenticated' || session.user.id)
        {
            return;
        }

        const fetchProfile = async () =>
        {
            try
            {
                const res = await axios.get('/api/user', 
                    {
                        headers: 
                        {
                            Authorization: `Bearer ${session?.accessToken}`
                        }
                    }
                );

                setProfile(res.data.me);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch (err: any)
            {
                console.error(err);
                setError(err?.response?.data?.error || 'Failed to fetch profile');
            }
            finally
            {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [status, session]);

    return (
        <>
            <div>
                <h1 className='text-5xl'>Profile</h1>

                <Card className='max-w-lg mx-auto'>
                    <CardBody className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-3'>
                        <Avatar
                            src={profile?.avatar.url}
                            alt='Avatar'
                            className='row-span-2'
                        />
                        <div>
                            <p className='font-semibold'>{session?.user.name}</p>
                            <p className='text-sm text-gray-500'>{profile?.wca_id}</p>
                        </div>

                        <div>
                            <p className='font-semibold'>{profile?.country.name}<span className={`ml-2 fi fi-${profile?.country.iso2.toLowerCase()} flag-shadow`}></span></p>
                            <p className='font-semibold'>{session?.user.email}</p>
                            <p className='text-sm text-gray-500'>{profile?.dob}</p>
                        </div>

                        <div className='col-span-2 pt-2 text-sm text-gray-600'>
                            text text text
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

export default Profile;