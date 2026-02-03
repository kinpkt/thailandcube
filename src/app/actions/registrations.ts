'use server';

import { prisma } from '@/lib/prisma';
import { Competitor, Event, Registration, RegistrationEvent, RegistrationStatus, Result } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { ExtendedCompetitor } from '../components/CompetitorManager';

interface RegistrationRecord
{
    competitorId: string;
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

export async function registerNewCompetitor({ payload, competitionId, eventsInComp }: { payload: RegistrationRecord, competitionId: string, eventsInComp: Event[] })
{
    try
    {
        const normalizedWCAID = (payload.wca_id && payload.wca_id.trim() !== '') ? payload.wca_id : null;

        let createdCompetitor;

        if (payload.competitorId && payload.competitorId.trim() !== '')
        {
            createdCompetitor = await prisma.competitor.upsert(
                {
                    where:
                    {
                        id: Number(payload.competitorId)
                    },
                    update:
                    {
                        name: payload.name,
                        wcaId: normalizedWCAID
                    },
                    create:
                    {
                        name: payload.name,
                        wcaId: normalizedWCAID,
                    },
                }
            );
        }
        else
        {
            if (normalizedWCAID) 
            {
                createdCompetitor = await prisma.competitor.upsert(
                    {
                        where: { wcaId: normalizedWCAID },
                        update: { name: payload.name },
                        create: 
                        { 
                            name: payload.name, 
                            wcaId: normalizedWCAID 
                        }
                    }
                );
            } 
            else 
            {
                createdCompetitor = await prisma.competitor.create(
                    {
                        data: 
                        {
                            name: payload.name,
                            wcaId: null,
                        }
                    }
                );
            }
        }

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
                    id: Number(payload.id),
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
            const rawValue = payload[columnHeader];
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

        return true;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
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
            
            let createdCompetitor;

            if (competitorData.wcaId)
                createdCompetitor = await prisma.competitor.upsert(
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
            else
                createdCompetitor = await prisma.competitor.create(
                    {
                        data:
                        {
                            name: competitorData.name,
                        }    
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

export async function deleteCompetitor({competitor, competitionId, eventsInComp}: {competitor?: ExtendedCompetitor | null, competitionId: string, eventsInComp: Event[]})
{
    try
    {
        if (!competitor)
            return;

        await prisma.registrationEvent.deleteMany(
            {
                where:
                {
                    registration:
                    {
                        competitionId,
                        competitorId: competitor.id
                    },
                }
            }
        );

        await prisma.registration.delete(
            {
                where:
                {
                    competitorId_competitionId:
                    {
                        competitorId: competitor.id,
                        competitionId
                    }
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
