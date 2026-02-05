'use client';

import { dateToRange } from '@/lib/DateTimeFormatter';
import { Button, Link } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CompetitionDetails = ({competition}: {competition: any}) =>
{
    const locale = useLocale();
    const t = useTranslations();

    return (
        <>
            <div className='mx-auto w-fit text-left'>
                <p className='text-4xl font-bold'>{competition?.name ?? "Lotus's Banga-Trat Cube Battle 2026"}</p>
                <p className='text-xl'>{competition?.startDate && competition?.endDate ? dateToRange(competition?.startDate, competition?.endDate) : "28 February - 1 March 2026"} @{competition?.venue ?? "Lotus's Bangna-Trat, Samut Prakan, Thailand"}</p>
                <Button className='mt-5' color='success' variant='flat' as={Link} href='https://docs.google.com/forms/d/e/1FAIpQLSfizf8EuVAvcKO86AamWJyAEmjXgHHIT08LOvTG3cr6zz3exA/viewform?usp=header'>{t('CompetitionInfo.register')}</Button>
                <Button className='mt-5 mx-5' color='warning' variant='flat' as={Link} href='#schedule'>{t('CompetitionInfo.schedule')}</Button>
            </div>
        </>
    );
}

export default CompetitionDetails;
