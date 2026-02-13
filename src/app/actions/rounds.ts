'use server';

import { EventType, Round } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getEventByCompetitionId } from './events';
import { getRoundResults } from './results';

interface Options
{
    withEvent?: boolean
    withResults?: boolean
}

interface CreatedResultData
{
    roundId: number;
    competitorId: number;
    attempts: number[];
}

export async function getRoundDetails({competitionId, event, round}: {competitionId: string, event: string, round: number}, options: Options = {})
{
    const { withEvent = true, withResults = true } = options; 

    const [eventType, maxAge] = event.split('-U');

    try
    {
        const rounds = await prisma.round.findFirst(
            {
                where:
                {
                    round,
                    event:
                    {
                        competitionId,
                        event: eventType as EventType,
                        maxAge: Number.isNaN(Number(maxAge)) ? undefined : Number(maxAge),
                    }
                },
                include:
                {
                    event: withEvent,
                    results: withResults,
                }
            }
        );

        return rounds || null;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function getAllRoundsByEventId({eventId}: {eventId: number}, options: Options = {})
{
    const { withEvent = true, withResults = true } = options; 

    try
    {
        const rounds = await prisma.round.findMany(
            {
                where:
                {
                    eventId
                },
                include:
                {
                    event: withEvent,
                    results: withResults
                }
            }
        );

        return rounds || null;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function updateRound({eventId, roundNumber, roundData}: {eventId: number, roundNumber: number | undefined, roundData: Round})
{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { id, event, results, ...data } = roundData as any;
    
    try
    {
        const rounds = await prisma.round.upsert(
            {
                where:
                {
                    eventId_round:
                    {
                        eventId,
                        round: roundNumber!
                    }
                },
                update:
                {
                    ...data,
                },
                create:
                {
                    ...data as Round,
                    eventId: eventId!,
                    round: data.round!
                }
            }
        );

        return rounds || null;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function openRound({competitionId, eventId, roundNumber}: {competitionId: string, eventId: number, roundNumber: number})
{
    try
    {
        if (roundNumber === 1)
        {
            const allRegistrationsInEvent = await prisma.registrationEvent.findMany(
                {
                    where:
                    {
                        eventId,
                        registration:
                        {
                            competitionId
                        }
                    },
                    include:
                    {
                        registration:
                        {
                            include:
                            {
                                competitor: true,
                            }
                        }
                    }
                }
            );

            const eventResult = await prisma.round.findUniqueOrThrow(
                {
                    where:
                    {
                        eventId_round:
                        {
                            eventId,
                            round: roundNumber
                        }
                    },
                    select:
                    {
                        id: true,
                        results: true,
                    }
                }
            );

            const blankResultsData: CreatedResultData[] = [];

            for (const competitorInEvent of allRegistrationsInEvent)
            {
                const data: CreatedResultData = {
                    roundId: eventResult.id,
                    competitorId: Number(competitorInEvent.registration.competitor.id),
                    attempts: [],
                };

                blankResultsData.push(data);
            }

            await prisma.result.createMany(
                {
                    data: blankResultsData,
                }
            );

            await prisma.round.update(
                {
                    where:
                    {
                        eventId_round:
                        {
                            eventId,
                            round: roundNumber
                        }
                    },
                    data:
                    {
                        open: true,
                    }
                }
            );

            return true;
        }
        else
        {
            const roundDetails = await prisma.round.findFirst(
                {
                    where:
                    {
                        eventId,
                        round: roundNumber,
                    },
                    include:
                    {
                        event: true,
                    }
                }
            );

            const previousRoundDetails = await prisma.round.findFirst(
                {
                    where:
                    {
                        eventId: eventId,
                        round: roundNumber-1
                    },
                    select:
                    {
                        proceed: true,
                    }
                }
            )

            const eventString = `${roundDetails?.event.event}${roundDetails?.event.maxAge ? `-${roundDetails?.event?.maxAge}` : ''}`;

            const {valued, blank} = await getRoundResults({competitionId, event: eventString, round: roundNumber-1});

            const threshold = Number.isInteger(previousRoundDetails?.proceed) ? previousRoundDetails?.proceed : Math.floor(valued.length*(previousRoundDetails?.proceed ?? 0));

            const passedCompetitors = valued.slice(0, threshold!);

            const resultsData = passedCompetitors.map((competitor) => (
                {
                    roundId: roundDetails?.id ?? 0,
                    competitorId: competitor.competitorId,
                    attempts: [],
                }
            ));

            await prisma.result.createMany(
                {
                    data: resultsData,
                    skipDuplicates: true,
                }
            );

            await prisma.round.update(
                {
                    where:
                    {
                        id: roundDetails?.id,
                    },
                    data:
                    {
                        open: true,
                    }
                }
            );
        }
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        throw new Error('Error occured while opening a round');
    }
}