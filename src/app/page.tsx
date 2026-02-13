/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import CompetitionInfoCard from './components/CompetitionInfoCard';
import axios from 'axios';
import { getAllCompetitions } from './actions/competitions';
// import { useLocale, useTranslations } from 'next-intl';
import { getTranslations, getLocale } from 'next-intl/server';

const Page = async () =>
{
    const t = await getTranslations('HomePage');
    const locale = await getLocale();

    let wcaCompetitions;

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];    
    const apiUrl = `${process.env.WCA_URL}/api/v0/competitions?country_iso2=TH&start=${todayString}`;

    try {
        const res = await axios.get(apiUrl);
        wcaCompetitions = res.data.map((comp: any) => ({
            ...comp,
            competitionId: comp.id,
            startDate: new Date(comp.start_date), 
            endDate: new Date(comp.end_date)
        }));
    } catch (error) {
        console.error("Failed to fetch WCA competitions:", error);
        // Handle error gracefully (e.g., wcaCompetitions remains empty)
    }

    const latestCompetition = await prisma.competition.findFirst(
        {
            orderBy:
            {
                startDate: 'asc'
            }
        }
    );

    const nonWcaCompetitions = await getAllCompetitions();

    return (
        <>
            <h1 className='text-4xl'>{t('heading')}</h1>
            <h1 className='text-3xl'>{t('subheading')}</h1>
            <div className='mt-5'>
                <h1 className='text-2xl mb-2'>{t('our_activities')}</h1>
                {latestCompetition && <CompetitionInfoCard competition={latestCompetition} isWCA={false}/>}
            </div>
            <div>
                <h1 className='text-2xl mb-2'>{t('wca_competitions')}</h1>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5'>
                {
                    wcaCompetitions?.map((competition: any) => (
                        <CompetitionInfoCard key={competition.id} competition={competition} isWCA={true}/>
                    ))
                }
                </div>
            </div>
        </>
    );
}

export default Page;
