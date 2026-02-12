'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Button, Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Image, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Divider } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { getUserRole } from '@/app/actions/users';
import { Role } from '@prisma/client';

const menuItems = [
  { name: 'About Us', href: 'about' },
  { name: 'Resources', href: 'resources' },
  { name: 'Statistics', href: 'statistics' },
  { name: 'FAQs', href: 'faqs' },
];

const Header = () =>
{
    const {isOpen: isLoginOpen, onOpen: onLoginOpen, onOpenChange: onLoginOpenChange} = useDisclosure();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

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
                const role = await getUserRole(Number(session.user.id));

                setIsAdmin(role === Role.SUPERUSER || role === Role.ADMIN);
                setIsSuperuser(role === Role.SUPERUSER);
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
            <Navbar className='bg-blue-200 mb-5' onMenuOpenChange={setIsMenuOpen}>
                <NavbarContent justify='start'>
                    <NavbarBrand as={Link} href='/'>
                        <Image src='/img/thailandcube.svg' width={40} alt='ThailandCube'/>
                        <p className='font-bold text-black text-xl ml-5'>{t('thailandcube')}</p>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className='hidden sm:flex gap-4' justify='center'>
                    {
                        menuItems.map((menu) => (
                            <NavbarItem key={menu.href} isActive={pathname === `/${menu.href}`}>
                                <Link color={pathname === `/${menu.href}` ? 'primary' : 'foreground'} href={`/${menu.href}`}> 
                                    {t(menu.href)}
                                </Link>
                            </NavbarItem>
                        ))
                    }
                </NavbarContent>

                <NavbarContent justify='end'>
                    <NavbarItem className='hidden sm:flex'>
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
                    <NavbarItem className='hidden sm:flex'>
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
                                {isSuperuser ? <DropdownItem key='create-unofficial-competition' href='/new-competition'>{t('dropdown.create_new_competition')}</DropdownItem> : <></>}
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
                    <NavbarMenuToggle className='sm:hidden' aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
                </NavbarContent>

                <NavbarMenu className='bg-blue-100/90 pt-6'>
                    {menuItems.map((menu, index) => (
                        <NavbarMenuItem key={`${menu}-${index}`}>
                            <Link className='w-full' color={pathname === menu.href ? 'primary' : 'foreground'} href={`/${menu.href}`} size='lg'>
                                {t(menu.href)}
                            </Link>
                        </NavbarMenuItem>
                    ))}

                    <Divider className='my-4'/>

                    {session ? (
                        <>
                            <NavbarMenuItem>
                                <div className='flex items-center gap-3 mb-2'>
                                    <Avatar isBordered color='primary' src={session?.user?.image ?? ''} />
                                    <div className='flex flex-col'>
                                        <span className='font-bold text-sm'>{session.user.name}</span>
                                        <span className='text-tiny text-default-500'>{session.user.email}</span>
                                    </div>
                                </div>
                            </NavbarMenuItem>
                            
                            <NavbarMenuItem>
                                <Link className='w-full' href='/profile' color='foreground' size='lg'>
                                    {t('dropdown.profile')}
                                </Link>
                            </NavbarMenuItem>
                            {
                                isSuperuser ?
                                (<NavbarMenuItem>
                                    <Link className='w-full' href='/new-competition' color='foreground' size='lg'>
                                        {t('dropdown.create_new_competition')}
                                    </Link>
                                </NavbarMenuItem>) : <></>
                            }
                            {
                                isAdmin ? 
                                (<NavbarMenuItem>
                                    <Link className='w-full' href='/admin/dashboard' color='foreground' size='lg'>
                                        {t('dropdown.admin')}
                                    </Link>
                                </NavbarMenuItem>): <></>
                            }
                            <NavbarMenuItem>
                                <Link className='w-full text-danger' onPress={() => signOut()} size='lg'>
                                    {t('dropdown.logout')}
                                </Link>
                            </NavbarMenuItem>
                        </>
                    ) : (
                        <NavbarMenuItem>
                            {/* <Button color='primary' fullWidth onPress={onLoginOpen}>
                                {t('login')}
                            </Button> */}
                        </NavbarMenuItem>
                    )}

                    <NavbarMenuItem className='mt-4'>
                        <div className='flex gap-2'>
                            <Button size='sm' variant={locale === 'th' ? 'solid' : 'bordered'} onPress={() => switchLocale('th')}>
                                ภาษาไทย
                            </Button>
                            <Button size='sm' variant={locale === 'en' ? 'solid' : 'bordered'} onPress={() => switchLocale('en')}>
                                English
                            </Button>
                        </div>
                    </NavbarMenuItem>
                </NavbarMenu>
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