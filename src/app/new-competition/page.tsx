import CreateCompForm from '@/app/components/CreateCompForm';
import { useTranslations } from 'next-intl';
import SuperUserCreateCompForm from '../components/SuperUserCreateCompForm';

const Page = () =>
{
    const t = useTranslations('NewCompetition');

    return (
        <>
            <h1 className='text-5xl'>{t('title')}</h1>
            <SuperUserCreateCompForm/>
            {/* <CreateCompForm/> */}
        </>
    );
}

export default Page;