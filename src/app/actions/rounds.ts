'use server';

import { EventType, Round } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getEventByCompetitionId } from './events';

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

export async function getRoundDetails({competitionId, event, round}: {competitionId: string, event: EventType, round: number}, options: Options = {})
{
    const { withEvent = true, withResults = true } = options; 

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
                        event
                    }
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
    const { id, ... data } = roundData;

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
                    eventId: data.eventId!,
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
                competitorId: Number(competitorInEvent.registration.competitionId),
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

        return true || null;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}