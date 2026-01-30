import { EventCodeToFullMap } from '@/lib/EnumMapping';
import ResultTable from '@/app/components/ResultTable';
import { EventType } from '@prisma/client';
import { getRoundResults } from '@/app/actions/results';
import { getRoundDetails } from '@/app/actions/rounds';

const Page = async ({ params }: {params: Promise<{competitionId: string, event: string, round: string}>}) =>
{
    const { competitionId, event: eventId, round } = await params;
    const roundNumber = Number(round.slice(1));

    const results = (await getRoundResults({competitionId, event: eventId as EventType, round: roundNumber})) ?? [];
    results.sort((a, b) => {
        const aPositive = (a.result ?? 0) > 0 ? 1 : 0;
        const bPositive = (b.result ?? 0) > 0 ? 1 : 0;
        if (aPositive !== bPositive) return bPositive - aPositive;

        const aResult = a.result ?? 0;
        const bResult = b.result ?? 0;
        if (aResult !== bResult) return aResult - bResult;

        const aBest = a.best ?? Infinity;
        const bBest = b.best ?? Infinity;
        if (aBest !== bBest) return aBest - bBest;

        return a.competitor.name.localeCompare(b.competitor.name);
    });

    const roundDetail = await getRoundDetails({competitionId, event: eventId as EventType, round: roundNumber});

    return (
        <>
            <h2 className='text-3xl mb-5'>{EventCodeToFullMap[eventId as keyof typeof EventCodeToFullMap]} Round {roundNumber}</h2>
            <ResultTable results={results} roundDetail={roundDetail} route={{competitionId, event: eventId as EventType, roundNumber}}/>
        </>
    );
}

export default Page;