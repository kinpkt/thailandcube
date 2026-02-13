import { getCompetition } from '@/app/actions/competitions';
import CompetitionSchedule from '@/app/components/CompetitionSchedule';
import CompetitionDetails from '@/app/components/CompetitionDetails';
import CompetitionInfoResults from '../components/CompetitionInfoResults';

const Page = async ({ params }: {params: Promise<{competitionId: string}>}) =>
{
    const competitionDetails = await getCompetition((await params).competitionId, {withRound: true});

    return (
        <>
            <CompetitionDetails competition={competitionDetails}/>
            <CompetitionSchedule competition={competitionDetails}/>
            <CompetitionInfoResults competition={competitionDetails}/>
        </>
    );
}

export default Page;