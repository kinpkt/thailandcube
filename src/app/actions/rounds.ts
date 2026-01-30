'use server';

import { EventType, Round } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getEventByCompetitionId } from './events';

export async function getRoundDetails({competitionId, event, round}: {competitionId: string, event: EventType, round: number})
{
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

export async function updateRound({competitionId, event, roundData}: {competitionId: string, event: EventType, roundData: Round})
{
    const { id, ... data } = roundData;

    const eventRecord = await getEventByCompetitionId({competitionId, event});

    try
    {
        if (!eventRecord)
            throw new Error('Event record not found');

        const rounds = await prisma.round.upsert(
            {
                where:
                {
                    eventId_round:
                    {
                        eventId: eventRecord?.id,
                        round: roundData.round
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

export async function openRound({competitionId, event, round}: {competitionId: string, event: EventType, round: number})
{
    const eventRecord = await getEventByCompetitionId({competitionId, event});

    try
    {
        if (!eventRecord)
            throw new Error('Event record not found');

        await prisma.round.update({
            where:
            {
                eventId_round:
                {
                    eventId: eventRecord.id,
                    round: round
                }
            },
            data:
            {
                open: true,
            }
        });

        return true || null;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}