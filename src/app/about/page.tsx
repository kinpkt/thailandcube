'use client';

import { Card, CardHeader, CardBody, CardFooter, Image } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import AboutOurMembers from '../components/AboutOurMembers';

const Page = () =>
{
    const t = useTranslations('About');
    const locale = useLocale();

    return (
        <>
            <div className='max-w-7xl mx-auto px-4 md:px-10 py-8'>
                <h1 className='text-4xl font-bold'>{t('title')}</h1>
                <div className='flex flex-col gap-6 mt-5'>
                    <Card>
                        <CardHeader className='p-0 overflow-hidden'>
                            <Image src='/img/AboutCubing3Pics.png' alt='ThailandCube Banner' className='w-full object-cover rounded-b-none' radius='none'/>
                        </CardHeader>
                        <CardBody className='p-4 md:p-6'>
                            <p className='text-3xl font-bold mb-3'>{t('speedcubing_heading')}</p>
                            <p className='text-left md:text-justify leading-relaxed text-default-700'>&emsp;{t('speedcubing_content')}</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader className='p-0 overflow-hidden'>
                            <Image src='/img/ThailandCubeBanner.jpg' alt='ThailandCube Banner' className='w-full object-cover rounded-b-none' radius='none'/>
                        </CardHeader>
                        <CardBody className='p-4 md:p-6'>
                            <p className='text-3xl font-bold mb-3'>ThailandCube</p>
                            <p className='text-left md:text-justify leading-relaxed text-default-700'>&emsp;{t('thailandcube_content')}</p>
                        </CardBody>
                    </Card>
                </div>
                {/* <AboutOurMembers locale={locale}/> */}
            </div>
        </>
    );
}

export default Page;