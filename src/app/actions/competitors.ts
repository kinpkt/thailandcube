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
                    registrations: withRegistrations,
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

export async function getCompetitorsInRound({competitionId, event, round}: {competitionId: string, event: EventType, round: number}, options: Option = {})
{
    const { withRegistrations = false, withResults = true } = options; 

    try
    {
        const competitors = await prisma.result.findMany(
            {
                where:
                {
                    round:
                    {
                        round,
                        event:
                        {
                            competitionId,
                            event
                        }
                    }
                },
                include:
                {
                    competitor: true
                },
                orderBy:
                {
                    competitor: { name: 'asc' }
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