'use server';

import { Competition } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface Options
{
    withEvent?: boolean
    withRegistrations?: boolean
}

export async function getCompetition(competitionId: string, options: Options = {}) 
{
    const { withEvent = true, withRegistrations = true } = options; 

    const queryRelations = {
        events: withEvent,
        registrations: withRegistrations
    };

    try 
    {
        return await prisma.competition.findUnique({
            where: { competitionId },
            include: queryRelations
        });
    } 
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function getAllCompetitions(options: Options = {}) 
{
    const { withEvent = true, withRegistrations = true } = options; 

    const queryRelations = {
        events: withEvent,
        registrations: withRegistrations
    };

    try 
    {
        return await prisma.competition.findMany({
            include: queryRelations,
            orderBy: { startDate: 'desc' }
        });
    } 
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function createNewCompetition(payload: Competition)
{
    try
    {
        const newCompetition = await prisma.competition.create(
            {
                data: payload
            }
        );

        return newCompetition;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}