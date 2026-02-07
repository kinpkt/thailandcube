/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventCodeToFullMap } from '@/lib/EnumMapping';
import ResultTable from '@/app/components/ResultTable';
import { EventType } from '@prisma/client';
import { getRoundResults } from '@/app/actions/results';
import { getRoundDetails } from '@/app/actions/rounds';
import { getCompetitorsInRound } from '@/app/actions/competitors';

const Page = async ({ params }: {params: Promise<{competitionId: string, event: string, round: string}>}) =>
{
    const { competitionId, event, round } = await params;
    const [eventType, maxAge] = event.split('-U');
    const roundNumber = Number(round.slice(1));

    const resultsData = (await getCompetitorsInRound({
        competitionId, 
        event: eventType as EventType, 
        maxAge: Number(maxAge), 
        round: roundNumber
    }, {withRegistrations: true})) ?? { valued: [], blank: [] };

    const roundDetails = (await getRoundDetails({competitionId, event, round: roundNumber})) ?? null;

    return (
        <>
            <ResultTable results={resultsData as any} roundDetails={roundDetails} route={{competitionId, event: eventType as EventType, roundNumber}}/>
        </>
    );
}

export default Page;