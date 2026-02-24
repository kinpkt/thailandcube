'use client';

import { DocumentTextIcon } from '@heroicons/react/16/solid';
import { Card, CardHeader, CardBody, Divider } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ReactNode } from 'react';

const IconWrapper = ({ children }: { children: ReactNode }) => (
    <span className='flex-shrink-0 w-5 h-5'>{children}</span>
);

const YoutubeIcon = () => (
    <svg role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' className='fill-current'><title>YouTube</title><path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>
); 

const Page = () => 
{
    const t = useTranslations('FAQs');
    const locale = useLocale();

    const linkStyle = 'inline-flex items-center gap-2 align-middle hover:underline text-primary font-medium';

    return (
        <>
            <h1 className='text-3xl font-bold mb-8'>{t('title')}</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto max-w-7xl ml-10 mr-10'>
                <Card className='h-full'>
                    <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                        <h3 className='font-bold text-lg'>{t('how_to_register')}</h3>
                    </CardHeader>
                    <CardBody className='overflow-visible py-4'>
                        {locale === 'th' ? (
                            <Link className={linkStyle} href={`docs/how-to-register-wca-${locale}.pdf`}>
                                <span>{t('how_to_register_ans')}</span>
                                <IconWrapper><DocumentTextIcon /></IconWrapper>
                            </Link>
                        ) : (
                            <p className='text-default-500'>{t('how_to_register_ans')}</p>
                        )}
                    </CardBody>
                </Card>
                <Card className='h-full'>
                    <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                        <h3 className='font-bold text-lg'>{t('find_comps')}</h3>
                    </CardHeader>
                    <CardBody className='overflow-visible py-4'>
                        {locale === 'th' ? (
                            <p className='leading-relaxed text-default-500'>
                                ท่านสามารถค้นหางานแข่งในประเทศไทยได้จาก
                                <Link href='/#activities' className='text-primary underline mx-1'>กิจกรรม</Link>
                                หรือ
                                <Link href='https://www.worldcubeassociation.org/competitions?region=Thailand' className='text-primary underline mx-1'>หน้าค้นหางานแข่งของ WCA</Link>
                            </p>
                        ) : (
                            <p className='leading-relaxed text-default-500'>
                                You can find our upcoming competitions at the 
                                <Link href='/#activities' className='text-primary underline mx-1'>Activities</Link> 
                                or via 
                                <a href='https://www.worldcubeassociation.org/competitions?region=Thailand' className='text-primary underline mx-1'>WCA website.</a>
                            </p>
                        )}
                    </CardBody>
                </Card>
                <Card className='h-full'>
                    <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                        <h3 className='font-bold text-lg'>{t('comp_process')}</h3>
                    </CardHeader>
                    <CardBody className='overflow-visible py-4'>
                        <div className='flex flex-col gap-3'>
                            <p className='text-default-500'>{t('comp_process_ans')}</p>
                            <Divider className='my-1'/>
                            <div className='flex flex-col gap-2'>
                                <Link className={linkStyle} href={t('comp_process_ans_yt_url')}>
                                    <span className='text-red-600 w-5 h-5 flex-shrink-0'><YoutubeIcon/></span>
                                    <span>{t('comp_process_ans_yt')}</span>
                                </Link>

                                <Link className={linkStyle} href={t('comp_process_ans_pdf_url')}>
                                    <IconWrapper><DocumentTextIcon/></IconWrapper>
                                    <span>{t('comp_process_ans_pdf')}</span>
                                </Link>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card className='h-full'>
                    <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                        <h3 className='font-bold text-lg'>{t('before_compete')}</h3>
                    </CardHeader>
                    <CardBody className='overflow-visible py-4'>
                        <p className='text-default-500'>{t('before_compete_ans')}</p>
                    </CardBody>
                </Card>
                <Card className='h-full'>
                    <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                        <h3 className='font-bold text-lg'>{t('judge_roles')}</h3>
                    </CardHeader>
                    <CardBody className='overflow-visible py-4'>
                         <div className='flex flex-col gap-3'>
                            <p className='text-default-500'>{t('judge_roles_ans')}</p>
                            <Divider className='my-1'/>
                            <div className='flex flex-col gap-2'>
                                <Link className={linkStyle} href={t('judge_roles_ans_yt_url')}>
                                    <span className='text-red-600 w-5 h-5 flex-shrink-0'><YoutubeIcon/></span>
                                    <span>{t('judge_roles_ans_yt')}</span>
                                </Link>
                                <Link className={linkStyle} href={t('judge_roles_ans_pdf_url')}>
                                    <IconWrapper><DocumentTextIcon/></IconWrapper>
                                    <span>{t('judge_roles_ans_pdf')}</span>
                                </Link>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card className='h-full'>
                    <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                        <h3 className='font-bold text-lg'>{t('receive_wca_id')}</h3>
                    </CardHeader>
                    <CardBody className='overflow-visible py-4'>
                        <p className='text-default-500'>{t('receive_wca_id_ans')}</p>
                    </CardBody>
                </Card>
                <Card className='h-full md:col-span-2'>
                    <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                        <h3 className='font-bold text-lg'>{t('local_comp')}</h3>
                    </CardHeader>
                    <CardBody className='overflow-visible py-4'>
                        <p className='text-default-500'>{t('local_comp_ans')}</p>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

export default Page;