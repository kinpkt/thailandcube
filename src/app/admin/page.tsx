'use client';

import { Card, CardHeader, CardBody, CardFooter, Link, Button, Image } from '@heroui/react';
import { signIn, useSession, signOut } from 'next-auth/react';

const Page = () =>
{
    return (
        <>
            <Card className='w-xl mx-auto'>
                <CardBody>
                    <Button as={Link} color='primary' variant='flat' onPress={() => signIn('wca')}><Image src='/img/wca.svg' width={30} height={30}/>Login with WCA</Button>
                </CardBody>
            </Card>
        </>
    );
}

export default Page;