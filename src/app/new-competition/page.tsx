import CreateCompForm from '@/app/components/CreateCompForm';
import { useTranslations } from 'next-intl';

const Page = () =>
{
    const t = useTranslations('NewCompetition');

    return (
        <>
            <h1 className='text-5xl'>{t('title')}</h1>
            <CreateCompForm/>
        </>
    );
}

export default Page;