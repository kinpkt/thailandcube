'use client';

import { DocumentTextIcon } from '@heroicons/react/16/solid';
import { Card, CardHeader, CardBody, CardFooter, Image, Divider } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ReactNode } from 'react';

const IconWrapper = ({ children }: { children: ReactNode }) => (
    <span className='flex-shrink-0 w-7 h-7'>{children}</span>
);

const Page = () =>
{
    const t = useTranslations('Resources');
    const locale = useLocale();

    const linkStyle = 'inline-flex items-center gap-2 align-middle hover:underline text-primary font-medium';

    return (
        <>
            <div className='max-w-7xl mx-auto px-4 md:px-10 py-8'>
                <h1 className='text-4xl'>{t('title')}</h1>
                <div className='flex flex-col gap-6 mt-10'>
                    <Card>
                        <CardHeader className='flex items-center gap-3 px-4 py-4'>
                            <p className='font-bold'>{t('wca_related')}</p>
                            <Image className='px-2' width={40} height={40}src='/img/wca.svg' alt='WCA Logo'/>
                        </CardHeader>
                        <Divider/>
                        <CardBody className='px-4 py-4'>
                            <ul className='list-outside list-disc ml-5 flex flex-col gap-3'>
                                <li><Link className={linkStyle} href='https://documents.worldcubeassociation.org/documents/policies/external/Competition%20Requirements.pdf'>{t('wca_comp_req')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                                <li><Link className={linkStyle} href='https://regulations.worldcubeassociation.org/wca-regulations-and-guidelines.pdf'>{t('wca_reg_guide')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                                <li><Link className={linkStyle} href='https://documents.worldcubeassociation.org/edudoc/judge-tutorial/judge-tutorial.pdf'>{t('judge_tutorial')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                                <li><Link className={linkStyle} href='https://documents.worldcubeassociation.org/edudoc/competitor-tutorial/tutorial.pdf'>{t('wca_comp_tutorial')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                            </ul>
                        </CardBody>
                    </Card>
                    <Card className='mb-5'>
                        <CardHeader><p className='font-bold'>{t('translated_docs')}</p><Image className='px-2' height={30}src='/img/thailandcube.svg' alt='ThailandCube Logo'/></CardHeader>
                        <Divider/>
                        <CardBody className='px-4 py-4'>
                            <ul className='list-outside list-disc ml-5 flex flex-col gap-3'>
                                <li><Link className={linkStyle} href='/docs/wca-regulations-th.pdf'>{t('wca_reg_guide_th')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                                <li><Link className={linkStyle} href='/docs/wca-competition-tutorial-th.pdf'>{t('wca_comp_tutorial_th')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                                <li><Link className={linkStyle} href='/docs/judging-tutorial-th.pdf'>{t('judge_tutorial_th')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                            </ul>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader><p className='font-bold'>{t('other_docs')}</p></CardHeader>
                        <Divider/>
                        <CardBody className='px-4 py-4'>
                            <ul className='list-outside list-disc ml-5 flex flex-col gap-3'>
                                <li><Link className={linkStyle} href={`/docs/how-to-solve-333-${locale}.pdf`}>{t('solving_guide')}<IconWrapper><DocumentTextIcon/></IconWrapper></Link></li>
                            </ul>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default Page;