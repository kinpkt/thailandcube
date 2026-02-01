'use server';

import { prisma } from '@/lib/prisma';
import { Competitor, Event, RegistrationStatus } from '@prisma/client';
import { parse } from 'csv-parse/sync';

interface RegistrationRecord
{
    id: string;
    name: string;
    wca_id: string;
    [key: string]: string;
}

const getEventColumnHeader = (e: Event) => 
{
    let eventType = e.event.toString();
    if (eventType.startsWith('E')) 
    {
        eventType = eventType.slice(1);
    }
    return e.maxAge ? `${eventType}_U${e.maxAge}` : eventType;
};

const isTruthy = (value: unknown): boolean => 
{
    if (value === undefined || value === null) 
    {
        return false;
    }
    const s = String(value).trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
};

export async function registerNewCompetitor({ competitor, competitionId, eventsInComp }: { competitor: Competitor, competitionId: string, eventsInComp: Event[] })
{
    // TODO: Implement single user logic here if needed
}

export async function batchRegisterNewCompetitorFromCSV({ csvText, competitionId, eventsInComp }: { csvText: string, competitionId: string, eventsInComp: Event[] })
{
    try
    {
        const records = parse(csvText,
            {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }
        ) as RegistrationRecord[];

        for (const record of records)
        {
            const competitorData = 
            {
                name: record.name,
                wcaId: record.wca_id,
            };

            const createdCompetitor = await prisma.competitor.upsert(
                {
                    where:
                    {
                        name: competitorData.name,
                        wcaId: competitorData.wcaId,
                    },
                    update:
                    {
                        wcaId: competitorData.wcaId,
                    },
                    create:
                    {
                        name: competitorData.name,
                        wcaId: competitorData.wcaId,
                    },
                }
            );

            const createdRegistration = await prisma.registration.upsert(
                {
                    where:
                    {
                        competitorId_competitionId:
                        {
                            competitorId: createdCompetitor.id,
                            competitionId,
                        },
                    },
                    update:
                    {
                        status: RegistrationStatus.ACCEPTED,
                    },
                    create:
                    {
                        id: Number(record.id),
                        competitorId: createdCompetitor.id,
                        competitionId,
                        status: RegistrationStatus.ACCEPTED,
                    },
                }
            );

            const eventsToCreate = eventsInComp
                .filter((event) => 
                {
                    const columnHeader = getEventColumnHeader(event);
                    const rawValue = record[columnHeader];
                    return isTruthy(rawValue);
                })
                .map((event) => 
                (
                    {
                        registrationId: createdRegistration.id,
                        eventId: event.id,
                    }
                ));

            if (eventsToCreate.length > 0)
            {
                await prisma.registrationEvent.createMany(
                    {
                        data: eventsToCreate,
                        skipDuplicates: true,
                    }
                );
            }
        }

        return { success: true, count: records.length };
    }
    catch (error)
    {
        console.error('CSV Processing Error:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error during CSV parsing' 
        };
    }
}