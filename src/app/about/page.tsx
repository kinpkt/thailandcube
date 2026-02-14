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
            <h1 className='text-4xl font-bold'>{t('title')}</h1>
            <div className='mt-5 mx-24'>
                <Card className='mb-5'>
                    <CardHeader>
                        <Image src='/img/AboutCubing3Pics.png' alt='ThailandCube Banner'/>
                    </CardHeader>
                    <CardBody>
                        <p className='text-3xl font-bold mb-3'>{t('speedcubing_heading')}</p>
                        <p className='text-justify'>&emsp;{t('speedcubing_content')}</p>
                    </CardBody>
                </Card>
                <Card className='mb-5'>
                    <CardHeader>
                        <Image src='/img/ThailandCubeBanner.jpg' alt='ThailandCube Banner'/>
                    </CardHeader>
                    <CardBody>
                        <p className='text-3xl font-bold mb-3'>ThailandCube</p>
                        <p className='text-justify'>&emsp;{t('thailandcube_content')}</p>
                    </CardBody>
                </Card>
            </div>
            <AboutOurMembers locale={locale}/>            
        </>
    );
}

export default Page;