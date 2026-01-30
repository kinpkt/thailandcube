'use server';

import { prisma } from '@/lib/prisma';
import { EventType } from '@prisma/client';

export async function getRoundResults({competitionId, event, round}: {competitionId: string, event: EventType, round: number})
{
    try
    {
        const results = await prisma.result.findMany(
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

        return results || [];
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}