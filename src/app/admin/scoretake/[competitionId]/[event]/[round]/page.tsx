import { getRoundDetails } from '@/app/actions/rounds';
import { getCompetitorsInRound } from '@/app/actions/competitors';
import ScoretakerPanel from '@/app/components/ScoretakerPanel';
import { EventType } from '@/generated/prisma';

const Page = async ({ params }: {params: Promise<{competitionId: string, event: string, round: string}>}) =>
{
    const { competitionId, event, round } = await params;
    const roundNumber = Number(round.slice(1));

    const resultsData = (await getCompetitorsInRound({competitionId, event: event as EventType, round: roundNumber})) ?? [];
    const roundDetail = (await getRoundDetails({competitionId, event: event as EventType, round: roundNumber})) ?? null;

    return (
        <>
            <ScoretakerPanel results={resultsData} eventDetail={roundDetail}/>
        </>
    );
}

export default Page;