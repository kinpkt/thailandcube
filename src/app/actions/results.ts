'use server';

import { prisma } from '@/lib/prisma';
import { Event, EventType, Round } from '@prisma/client';

interface ScoretakeData
{
    roundId?: number;
    event?: string;
    round?: number;
    competitorId: number;
    attempts: number[];
    result: number;
    best: number;
}

interface ExtendedRound extends Round
{
    event: Event;
}

export async function getRoundResults({competitionId, event, round}: {competitionId: string, event: string, round: number})
{
    try
    {
        const [eventType, maxAge] = event.split('-');
        const allResults = await prisma.result.findMany(
            {
                where:
                {
                    round:
                    {
                        round,
                        event:
                        {
                            competitionId,
                            event: eventType as EventType,
                            maxAge: Number.isNaN(Number(maxAge)) ? undefined : Number(maxAge),
                        }
                    },
                },
                include:
                {
                    competitor: true
                },
                orderBy: 
                [
                    { result: 'asc' },
                    { best: 'asc' }
                ]   
            }
        );

        const valued = allResults.filter(r => r.result !== null && r.result > 0);
        
        // "Blank" = Null, undefined, or 0
        const blank = allResults.filter(r => r.result === null || r.result <= 0);

        // 3. Sort "Valued" Results (Result -> Best -> Name)
        valued.sort((a, b) => {
            const resA = Number(a.result);
            const resB = Number(b.result);
            if (resA !== resB) return resA - resB; // Lower result is better

            const bestA = (a.best !== null) ? Number(a.best) : Infinity;
            const bestB = (b.best !== null) ? Number(b.best) : Infinity;
            if (bestA !== bestB) return bestA - bestB; // Lower best is better

            return (a.competitor?.name || "").localeCompare(b.competitor?.name || "");
        });

        // 4. Sort "Blank" Results (Name only, or Best then Name)
        // Usually blanks are just sorted alphabetically since they have no result.
        blank.sort((a, b) => {
            return (a.competitor?.name || "").localeCompare(b.competitor?.name || "");
        });

        // 5. Return the split sets
        return { valued, blank };
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        throw new Error('Found error while trying to get the result')
    }
}

export async function submitRoundResult({data, roundDetails}: {data: ScoretakeData, roundDetails: ExtendedRound | null})
{
    try
    {
        if (!roundDetails)
            throw new Error('No round details were provided');

        // const roundData = await prisma.result.findFirst(
        //     {
        //         where:
        //         {
        //             round:
        //             {
        //                 eventId: roundDetails.eventId,
        //             }
        //         }
        //     }
        // );

        await prisma.result.update(
            {
                where:
                {
                    competitorId_roundId:
                    {
                        competitorId: data.competitorId,
                        roundId: roundDetails.id,
                    },
                },
                data:
                {
                    attempts: data.attempts,
                    result: data.result,
                    best: data.best,
                },
            }
        );

        return true;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function clearRoundResult({competitionId, eventId, round}: {competitionId: string, eventId: number, round: number})
{
    try
    {
        const roundData = await prisma.round.findFirst(
            {
                where:
                {
                    round,
                    eventId
                },
                select:
                {
                    id: true,
                    open: true,
                }
            }
        );

        if (roundData?.open)
        {
            await prisma.result.updateMany(
                {
                    where:
                    {
                        round:
                        {
                            id: roundData.id,
                        }
                    },
                    data:
                    {
                        attempts: [],
                        best: null,
                        result: null,
                    }
                }
            );
        }
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}