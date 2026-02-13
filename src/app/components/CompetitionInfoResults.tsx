'use client';

import { EventCodeToFullMap } from '@/lib/EnumMapping';
import { Card, CardHeader, CardBody, CardFooter, Accordion, AccordionItem, Button, Link } from '@heroui/react';
import { Competition, Event, EventType, Registration, Round } from '@prisma/client';
import { useLocale, useTranslations } from 'next-intl';

interface ExtendedEvent extends Event
{
    rounds: Round[];
}

interface ExtendedCompetition extends Competition
{
    events: ExtendedEvent[];
    registrations: Registration[];
}

const CompetitionInfoResults = ({competition}: {competition: ExtendedCompetition | null}) =>
{
    const locale = useLocale();
    const t = useTranslations('CompetitionInfo');

    if (!competition)
        return <h1>Competition Not Found</h1>

    const getTitleString = (event: Event) =>
    {
        const eventString = EventCodeToFullMap[event.event as EventType];
        const ageString = locale === 'en' ? `Age ${event.maxAge} and Under` : `รุ่นอายุไม่เกิน ${event.maxAge} ปี`;

        if (!(eventString && ageString))
            return '';
        else if (event.maxAge)
            return `${eventString} (${ageString})`;
        else
            return eventString;
    }

    return (
        <>
            <div className='mx-auto w-[50%] mt-10' id='results'>
                <Card>
                    <CardHeader>
                        <p className='text-3xl font-bold'>{t('results')}</p>
                    </CardHeader>
                    <CardBody>
                        <Accordion selectionMode='multiple'>
                        {
                            competition.events.map((e) =>
                            (
                                <AccordionItem key={e.id} title={getTitleString(e)}>
                                    {
                                        e.rounds.map((r) =>
                                        (
                                            <div key={r.id} className='grid grid-cols-2 my-5'>
                                                <p>{locale === 'en' ? 'Round' : 'รอบที่'} {r.round}</p>
                                                <Button color={r.tournamentUrl ? 'secondary' : r.open ? 'primary' : 'danger'} variant='flat' as={Link} href={r.tournamentUrl ?? `${competition.competitionId}/results/${e.event}${e.maxAge ? `-U${e.maxAge}` : ''}/r${r.round}`} isDisabled={!(r.open || r.tournamentUrl)}>{r.tournamentUrl ? t('view_tournament') : r.open ? t('view_results') : t('round_not_open')}</Button>
                                            </div>
                                        ))
                                    }
                                </AccordionItem>
                            ))
                        }
                        </Accordion>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

export default CompetitionInfoResults;