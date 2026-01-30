'use server';

import { EventType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getEventByCompetitionId } from '@/app/actions/events';

export async function getCompetitorsInRound({competitionId, event, round}: {competitionId: string, event: EventType, round: number})
{
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