'use client';

import { Button } from '@heroui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const CreateCompForm = () =>
{
    const { data: session, status } = useSession();

    const handleCreate = async () =>
    {
        if (status !== 'authenticated')
        {
            alert('You must be logged in');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accessToken = (session as any)?.accessToken;

        if (!accessToken)
        {
            alert('Missing WCA access token');
            return;
        }

        try
        {
            const res = await axios.post('/api/delegate/create-competition',
                null,
                {
                    headers:
                    {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log('Competition created:', res.data);
            alert('Competition created successfully!');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any)
        {
            console.error('Create failed:', error.response?.data || error.message);
            alert('Failed to create competition');
        }
    };

    return (
        <div className='mx-auto text-center mt-5'>
            <Button onPress={handleCreate} color='primary' isDisabled={status === 'loading'}>
                Click to create new competition (test)
            </Button>
        </div>
    );
};

export default CreateCompForm;
