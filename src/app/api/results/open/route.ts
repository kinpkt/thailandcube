import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Result from '@/model/Result';

export async function POST(req: NextRequest)
{
    try
    {
        const body = await req.json();
        const { eventId, round } = body;

        const eventToIndex = ['333ni', '333oh', '333bf', 'mb'];

        const index = eventToIndex.indexOf(eventId);

        if (index < 0)
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });

        const competitors: {id: number}[] = await prisma.$queryRaw`
            SELECT id FROM "Competitor"
            WHERE events[${index+1}]=true
        `;

        const roundRecord = await prisma.round.findFirst({
            where: { eventId, round: Number(round) },
        });

        if (!roundRecord)
            return NextResponse.json({ error: 'Round not found' }, { status: 404 });

        if (round === 1)
        {
            const competitorData = competitors.map((comp) => ({
                competitorId: comp.id,
                roundId: roundRecord.id,
                attempts: []
            }));

            await prisma.result.createMany({data: competitorData})
        }
        else
        {
            const previousRoundRecord = await prisma.round.findFirst({
                where: { eventId, round: Number(round)-1 },
            });

            if (!previousRoundRecord)
                return NextResponse.json({ error: 'Previous round not found' }, { status: 404 });

            const results = await prisma.result.findMany({
                where: {round: {eventId, round: Number(round)-1}},
                include: {competitor: true}
            })

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

            let passedCompetitors: Result[] = [];

            if (previousRoundRecord.proceed != null && roundRecord?.proceed && Number.isInteger(previousRoundRecord?.proceed))
            {
                passedCompetitors = results.slice(0, previousRoundRecord?.proceed);
            }
            else if (previousRoundRecord.proceed != null && roundRecord?.proceed && !Number.isInteger(previousRoundRecord.proceed))
            {
                const passed = results.length*previousRoundRecord?.proceed;
                passedCompetitors = results.slice(0, passed);
            }

            const competitorData = passedCompetitors.map((r) => ({
                competitorId: r.competitor.id,
                roundId: roundRecord.id,
                attempts: [],
                result: 0,
                best: 0
            }));

            await prisma.result.createMany({data: competitorData});
        }

        return NextResponse.json({message: 'Successfully opened round' }, { status: 200 });
    }
    catch (err)
    {
        console.error(err);

        let message = 'Internal server error';
        if (err instanceof Error) 
            message = err.message;

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}