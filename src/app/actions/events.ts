'use server';

import { EventType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface Options
{
    withRounds?: boolean
    withRegistrationEvents?: boolean
} 

export async function getEventByCompetitionId({competitionId, event}: {competitionId: string, event: EventType}, options: Options = {})
{
    const { withRounds = true, withRegistrationEvents = true } = options; 

    const queryRelations = {
        rounds: withRounds,
        registrationEvents: withRegistrationEvents
    };

    try
    {
        const queriedEvent = await prisma.event.findFirst(
            {
                where:
                {
                    competitionId,
                    event
                },
                include: queryRelations
            }
        );

        return queriedEvent || null;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function getAllEventsByCompetitionId(competitionId: string, options: Options = {})
{
    const { withRounds = true, withRegistrationEvents = true } = options; 

    const queryRelations = {
        rounds: withRounds,
        registrationEvents: withRegistrationEvents
    };


    try
    {
        const queriedEvent = await prisma.event.findMany(
            {
                where:
                {
                    competitionId
                },
                include: queryRelations
            }
        );

        return queriedEvent || null;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}