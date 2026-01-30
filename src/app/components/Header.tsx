'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Button, Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Image, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { getUserRole } from '@/app/actions/users';
import { Role } from '@prisma/client';

const Header = () =>
{
    const {isOpen: isLoginOpen, onOpen: onLoginOpen, onOpenChange: onLoginOpenChange} = useDisclosure();
    const [isAdmin, setIsAdmin] = useState(false);

    const { data: session, status } = useSession();

    const router = useRouter();

    const t = useTranslations('Header');
    const locale = useLocale();

    const switchLocale = (nextLocale: string) => {
        document.cookie = `locale=${nextLocale}; path=/`;
        router.refresh();
    };

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const role = await getUserRole(Number(session.user.id));

                setIsAdmin(role === Role.SUPERUSER || role === Role.ADMIN);
                // setLoading(false);
            }
            catch (error)
            {
                throw error;
            }
        }

        fetchRoleFromDB();
    }, [status, session]);


    return (
        <>
            <Navbar className='bg-blue-200 mb-5'>
                <NavbarBrand as={Link} href='/'>
                    <Image src='/img/thailandcube.svg' width={40}/>
                    <p className='font-bold text-black text-xl ml-5'>{t('thailandcube')}</p>
                </NavbarBrand>
                {/* <NavbarContent className='hidden sm:flex gap-4' justify='center'>
                    <NavbarItem>
                    <Link color='foreground' href='#'>
                        Features
                    </Link>
                    </NavbarItem>
                    <NavbarItem isActive>
                    <Link aria-current='page' href='#'>
                        Customers
                    </Link>
                    </NavbarItem>
                    <NavbarItem>
                    <Link color='foreground' href='#'>
                        Integrations
                    </Link>
                    </NavbarItem>
                </NavbarContent> */}
                <NavbarContent justify='end'>
                    <NavbarItem>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant='flat' size='sm' startContent={<LanguageIcon className='w-4 h-4'/>}>
                                    {locale === 'th' ? 'ภาษาไทย' : 'English'}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label='Language switcher' onAction={(key) => switchLocale(key as string)}>
                                <DropdownItem key='th'>ภาษาไทย</DropdownItem>
                                <DropdownItem key='en'>English</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>

                    {status === 'loading' ? null : session ? (
                    <NavbarItem>
                        <Dropdown placement='bottom-end'>
                            <DropdownTrigger>
                            <Avatar
                                isBordered
                                as='button'
                                className='transition-transform'
                                color='primary'
                                name={session.user.name ?? ''}
                                size='md'
                                src={session?.user?.image ?? ''}
                            />
                            </DropdownTrigger>
                            <DropdownMenu aria-label='Profile Actions' variant='flat'>
                                <DropdownItem key='name' className='h-14 gap-2'>
                                    <p className='font-semibold'>{session.user.name}</p>
                                    <p className='font-semibold'>{session.user.email}</p>
                                </DropdownItem>
                                <DropdownItem key='profile' href='/profile'>{t('dropdown.profile')}</DropdownItem>
                                <DropdownItem key='my-competition'>{t('dropdown.my_competitions')}</DropdownItem>
                                {/* <DropdownItem key='create-draft-competition' href='/draft-competition'>{t('dropdown.create_new_competition')}</DropdownItem> */}
                                <DropdownItem key='create-unofficial-competition' href='/new-competition'>{t('dropdown.create_new_competition')}</DropdownItem>
                                {isAdmin ? <DropdownItem key='admin' href='/admin/dashboard'>{t('dropdown.admin')}</DropdownItem> : <></>}
                                <DropdownItem key='logout' color='danger' onPress={() => signOut()}>
                                    {t('dropdown.logout')}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                    ) :
                    <NavbarItem>
                        {/* <Button color='primary' variant='flat' onPress={onLoginOpen}>
                            {t('login')}
                        </Button> */}
                    </NavbarItem>
                    }
                </NavbarContent>
            </Navbar>

            <Modal isOpen={isLoginOpen} placement='top-center' onOpenChange={onLoginOpenChange}>
                <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className='flex flex-col gap-1'>Login</ModalHeader>
                        <ModalBody>
                            <Button as={Link} color='primary' variant='flat' onPress={() => signIn('wca')}><Image src='/img/wca.svg' width={30} height={30}/>Login with WCA</Button>
                        </ModalBody>
                        <ModalFooter>
                            <Button color='danger' variant='flat' onPress={onClose}>Close</Button>
                        </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default Header;