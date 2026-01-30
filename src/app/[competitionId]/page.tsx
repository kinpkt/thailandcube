import { getCompetition } from '@/app/actions/competitions';
import CompetitionSchedule from '@/app/components/CompetitionSchedule';
import CompetitionDetails from '@/app/components/CompetitionDetails';

const Page = async ({ params }: {params: Promise<{competitionId: string}>}) =>
{
    const competitionDetails = await getCompetition((await params).competitionId);

    return (
        <>
            <CompetitionDetails competition={competitionDetails}/>
            <CompetitionSchedule competition={competitionDetails}/>
        </>
    );
}

export default Page;