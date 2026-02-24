'use client';

import { Card, CardHeader, CardBody, CardFooter, Link, Button, Image, InputOtp, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Form } from '@heroui/react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = () =>
{
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const router = useRouter();

    useEffect(() => 
    {
        onOpen();
    }, []);

    return (
        <>
            <Card className='w-[75%] mx-auto'>
                <CardBody>
                    <Button as={Link} color='primary' variant='flat' onPress={() => signIn('wca')}><Image src='/img/wca.svg' width={30} height={30}/>Login with WCA</Button>
                </CardBody>
            </Card>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>
                                Passcode Required
                            </ModalHeader>
                            <ModalBody className='pb-6'>
                                <p className='text-sm text-default-500 mb-4 text-center'>
                                    Please enter your 4-digit passcode below.
                                </p>
                                <Form className='mx-auto' onSubmit={
                                    (e) =>
                                    {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        const data = formData.get('passcode')?.toString() || '';

                                        if (data === process.env.NEXT_PUBLIC_ADMIN_PASSCODE?.toString())
                                            onClose();
                                        else
                                            router.push('/');
                                    }
                                }>
                                    <InputOtp errorMessage='Invalid Passcode' name='passcode' length={4} placeholder='Enter Passcode' isRequired/>
                                    <Button type='submit' color='primary' className='mt-4 w-full'>
                                        Verify
                                    </Button>
                                </Form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default Page;