import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest)
{
    const { searchParams } = new URL(req.url);
    const event = searchParams.get('event') || '';
    const round = searchParams.get('round') || '';
    const countOnly = searchParams.get('count')?.toLowerCase() === 'true' || false;

    let result;

    if (!event || !round)
    {
        result = await prisma.$queryRaw<{ eventID: string, round: number, count: bigint }[]>`
            SELECT rd."eventId", rd."round", COUNT(*) AS count
            FROM "Result" AS r
            JOIN "Round" AS rd ON r."roundID" = rd."id"
            GROUP BY rd."eventId", rd."round"
            ORDER BY rd."eventId", rd."round"
        `;

        return NextResponse.json(result.map(r => ({ ...r, count: Number(r.count) })), { status: 200 });
    }

    if (countOnly)
    {
        result = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) AS count
            FROM "Result" AS r
            JOIN "Round" AS rd ON r."roundId" = rd."id"
            WHERE rd."eventId" = ${event} AND rd."round" = ${Number(round)}
        `;

        return NextResponse.json({count: Number(result[0].count)}, {status: 200});
    }
    else
    {
        result = await prisma.result.findMany({
            where: {round: {eventId: event, round: Number(round)}},
            include: {competitor: true}
        })

        result.sort((a, b) => {
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

        return NextResponse.json({result}, {status: 200});
    }
} 

export async function POST(req: NextRequest) 
{
    try
    {
        const body = await req.json();
        const { eventId, eventRound, competitorId, attempts, result, best } = body;

        console.log(body)

        if ([eventId, eventRound, competitorId, attempts, result, best].some(v => v === null || v === undefined))
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });

        const roundRecord = await prisma.round.findFirst({
            where: { eventId, round: Number(eventRound) },
        });

        if (!roundRecord)
            return NextResponse.json({ error: 'Round not found' }, { status: 404 });

        await prisma.result.upsert({
            where: 
            {
                competitorId_roundId: 
                {
                    competitorId,
                    roundId: roundRecord.id
                }
            },
            update: { attempts, result, best },
            create: 
            {
                competitorId,
                roundId: roundRecord.id,
                attempts,
                result,
                best
            }
        });

        return NextResponse.json(
            { message: 'Submit result successfully.' },
            { status: 200 }
        );
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

export async function DELETE(req: NextRequest)
{
    try
    {
        const body = await req.json();
        const { eventId, round } = body;

        console.log(body)

        if (!(eventId && round))
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });

        const roundRecord = await prisma.round.findFirst({
            where: { eventId, round: Number(round) },
        });

        if (!roundRecord)
            return NextResponse.json({ error: 'Round not found' }, { status: 404 });

        await prisma.result.updateMany({
            where: 
            {
                roundId: roundRecord.id
            },
            data: 
            {
                attempts: [],
                result: 0,
                best: 0,
            }
        });

        return NextResponse.json(
            { message: 'Submit result successfully.' },
            { status: 200 }
        );
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