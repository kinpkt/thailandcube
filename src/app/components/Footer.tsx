'use client';

import { Link } from '@heroui/link';
import { Image } from '@heroui/image';
import { Divider } from '@heroui/divider';
import { useLocale, useTranslations } from 'next-intl';
import { BsFacebook, BsInstagram, BsYoutube } from 'react-icons/bs';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className='w-full bg-primary-100 text-black mt-10'>
      <div className='mx-auto max-w-7xl px-6 py-10'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
          {/* Brand section */}
          <div className='flex flex-col gap-4'>
            <Image
              src='/img/thailandcube.svg'
              alt='ThailandCube'
              width={75}
              radius='none'
            />
            <p className='text-2xl font-semibold'>{t('thailandcube')}</p>
            <p className='text-sm text-black/80'>{t('subtitle')}</p>
          </div>

          {/* Contact section */}
          <div className='flex flex-col gap-3'>
            <p className='text-lg font-semibold'>
              {t('contact_us')}
            </p>

            <Link
              href='mailto:contact.thailandcube@gmail.com'
              color='foreground'
              className='text-black'
            >
              contact.thailandcube@gmail.com
            </Link>

            <p className='text-sm text-black/80'>
              {t('forms_text')} {' '}
              <Link
                href='https://forms.gle/GQbgBGqpxiwSnVve8'
                className='text-black underline'
              >
                Google Forms
              </Link>
            </p>

            <div className='flex flex-col gap-2 text-sm'>
              <Link
                href='https://www.facebook.com/Thcube'
                className='flex items-center gap-2 text-black'
              >
                <BsFacebook/> Facebook: <u>ThailandCube</u>
              </Link>
              <Link
                href='https://www.instagram.com/@thailandcube'
                className='flex items-center gap-2 text-black'
              >
                <BsInstagram/> Instagram: <u>@thailandcube</u>
              </Link>
              <Link
                href='https://www.youtube.com/@ThailandCube'
                className='flex items-center gap-2 text-black'
              >
                <BsYoutube/> Youtube: <u>ThailandCube</u>
              </Link>
            </div>
          </div>
        </div>

        <Divider className='my-3 bg-white/20' />

        <div className='text-center text-md text-black/80'>
          &copy; {new Date().getFullYear()} ThailandCube – All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}