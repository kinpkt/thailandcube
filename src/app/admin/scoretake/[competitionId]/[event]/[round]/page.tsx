/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRoundDetails } from '@/app/actions/rounds';
import ScoretakerPanel from '@/app/components/ScoretakerPanel';
import { getRoundResults } from '@/app/actions/results';
import { getCompetitorsInRound } from '@/app/actions/competitors';
import { EventType } from '@prisma/client';

const Page = async ({ params }: {params: Promise<{competitionId: string, event: string, round: string}>}) =>
{
    const { competitionId, event, round } = await params;
    const roundNumber = Number(round.slice(1));
    const [eventType, maxAge] = event.split('-');

    const resultsData = (await getCompetitorsInRound({
        competitionId, 
        event: eventType as EventType,
        maxAge: Number(maxAge),
        round: roundNumber
    }, {withRegistrations: true})) ?? { valued: [], blank: [] };

    const roundDetails = (await getRoundDetails({competitionId, event, round: roundNumber})) ?? null;

    return (
        <>
            <ScoretakerPanel results={resultsData as any} roundDetails={roundDetails}/>
        </>
    );
}

export default Page;