'use server';

import { EventType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getEventByCompetitionId } from '@/app/actions/events';

interface Option
{
    withRegistrations?: boolean;
    withResults?: boolean;
}

export async function getAllCompetitorsByCompetitionId(competitionId: string, options: Option = {})
{
    const { withRegistrations = true, withResults = false } = options; 

    try
    {
        const competitors = await prisma.competitor.findMany(
            {
                where:
                {
                    registrations:
                    {
                        some:
                        {
                            competitionId
                        }
                    }
                },
                include:
                {
                    registrations: withRegistrations ?
                    {
                        where:
                        {
                            competitionId: competitionId
                        },
                        // include:
                        // {
                        //     events: true,
                        // },
                        select:
                        {
                            competitionId: true,
                            events:
                            {
                                select:
                                {
                                    event: true,
                                    eventId: true,
                                }
                            },
                            id: true,
                        }
                    } : false,
                    results: withResults,
                }
            }
        );

        return competitors || [];
    }
    catch (error)
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function getCompetitorsInRound({competitionId, event, maxAge, round}: {competitionId: string, event: EventType, maxAge: number, round: number}, options: Option = {})
{
    const { withRegistrations = false, withResults = true } = options; 

    try
    {   
        const roundData = await prisma.round.findFirst(
            {
                where:
                {
                    round,
                    event:
                    {
                        competitionId,
                        event,
                        maxAge: Number.isNaN(maxAge) ? undefined : maxAge,
                    },
                }
            }
        );

        const competitors = await prisma.result.findMany(
            {
                where:
                {
                    roundId: roundData?.id,
                },
                include:
                {
                    competitor: 
                    {
                        include:
                        {
                            registrations: withRegistrations,
                            results: withResults,
                        }
                    },
                },
                orderBy:
                {
                    competitor: { name: 'asc' }
                }
            }
        );

        return competitors;
    }
    catch (error)
    {
        console.error('Database Error:', error);
        return null;
    }
}