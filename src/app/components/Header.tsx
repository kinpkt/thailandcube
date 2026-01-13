'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Button, Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Image, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageIcon } from '@heroicons/react/16/solid';

const Header = () =>
{
    const {isOpen: isLoginOpen, onOpen: onLoginOpen, onOpenChange: onLoginOpenChange} = useDisclosure();

    const { data: session, status } = useSession();

    const router = useRouter();

    console.log(session);

    const t = useTranslations('Header');
    const locale = useLocale();

    const switchLocale = (nextLocale: string) => {
        document.cookie = `locale=${nextLocale}; path=/`;
        router.refresh();
    };

    return (
        <>
            <Navbar className='bg-blue-200 mb-5'>
                <NavbarBrand as={Link} href='/'>
                    <Image src='/img/ThailandCube.svg' width={40}/>
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
                                <Button variant='flat' size='sm' startContent={<LanguageIcon/>}>
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
                                <DropdownItem key='mycomp'>{t('dropdown.my_competitions')}</DropdownItem>
                                <DropdownItem key='createcomp' href='/new-competition'>{t('dropdown.create_new_competition')}</DropdownItem>
                                <DropdownItem key='logout' color='danger' onPress={() => signOut()}>
                                    {t('dropdown.logout')}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                    ) :
                    <NavbarItem>
                        <Button color='primary' variant='flat' onPress={onLoginOpen}>
                            {t('login')}
                        </Button>
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