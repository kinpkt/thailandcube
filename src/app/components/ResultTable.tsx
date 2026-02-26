/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Competitor, Event, EventType, Registration, ResultStatus, Round, Result } from '@prisma/client';
import { numToFormatted } from '@/lib/DateTimeFormatter';
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@heroui/react';
import { useMemo } from 'react';
import { EventCodeToFullMap } from '@/lib/EnumMapping';
import { useLocale, useTranslations } from 'next-intl';

interface ResultTableRoute
{
    competitionId: string;
    event: EventType;
    roundNumber: number;
}

type RoundWithEventInfo = Round & 
{
    event: Event
}

type ResultWithCompetitor = Result & 
{
    rank?: number;
    competitor: Competitor & {registrations: Registration[]};
}


interface ResultTableProps
{
    results: ResultWithCompetitor[] | {valued: ResultWithCompetitor[], blank: ResultWithCompetitor[]};
    roundDetails: RoundWithEventInfo | null;
    route: ResultTableRoute;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResultTable = ({results: rawResults, roundDetails, route}: ResultTableProps) =>
{
    const t = useTranslations('ResultTable');
    const locale = useLocale();

    const isBlindfolded = route.event === EventType.E333BF;
    const totalAttempts = isBlindfolded ? 3 : 5;

    const { valued, blank } = useMemo(() => {
        if (!rawResults) return { valued: [], blank: [] };

        let flatList: ResultWithCompetitor[] = [];

        if ('valued' in rawResults && Array.isArray((rawResults as any).valued)) {
            const objResults = rawResults as { valued: ResultWithCompetitor[], blank: ResultWithCompetitor[] };
            flatList = [...objResults.valued, ...objResults.blank];
        }
        else if (Array.isArray(rawResults)) {
            flatList = rawResults as ResultWithCompetitor[];
        }

        return {
            valued: flatList
                .filter(r => r.result !== null && r.result > 0)
                .sort((a, b) => Number(a.result) - Number(b.result)),

            blank: flatList
                .filter(r => r.result === null || r.result <= 0)
                .sort((a, b) => {
                    if (a.result !== null && b.result === null) return -1;
                    if (a.result === null && b.result !== null) return 1;
                    if (a.result === null && b.result === null) return 0;

                    const bestA = (a.best !== null && a.best > 0) ? a.best : Infinity;
                    const bestB = (b.best !== null && b.best > 0) ? b.best : Infinity;

                    return bestA - bestB;
                })
        };
    }, [rawResults]);

    const allResults = useMemo(() => [...valued, ...blank], [valued, blank]);

    const totalParticipants = valued.length + blank.length;
        const totalQuit = valued.filter((result) => result.status === ResultStatus.DROPOUT).length;
        let proceedingCount = roundDetails?.proceed ? 0 : 3;
        if (roundDetails?.proceed && Number.isInteger(roundDetails?.proceed))
            proceedingCount = roundDetails?.proceed + totalQuit;
        else if (roundDetails?.proceed)
            proceedingCount = Math.floor(roundDetails?.proceed * totalParticipants) + totalQuit;

    const getTitleString = () =>
    {
        const eventString = EventCodeToFullMap[roundDetails?.event.event as EventType];
        const ageString = locale === 'en' ? `Age ${roundDetails?.event.maxAge} and Under` : `รุ่นอายุไม่เกิน ${roundDetails?.event.maxAge} ปี`;
        const roundString = `${t('round')} ${roundDetails?.round}`;

        if (!(eventString && ageString && roundString))
            return '';
        else if (roundDetails?.event.maxAge)
            return `${eventString} (${ageString}) ${roundString}`;
        else
            return `${eventString} ${roundString}`;
    }

    const getProceedingString = () =>
    {
        const isPercentage = !Number.isInteger(roundDetails?.proceed);
        const valueString = isPercentage && roundDetails?.proceed ? `${roundDetails?.proceed*100}%` : roundDetails?.proceed;

        return locale === 'en' ? `Advancement: Top ${valueString} competitors advance to the next round` : `เงื่อนไขการเข้ารอบ: ผู้เข้าแข่งขัน ${valueString} ${isPercentage ? '' : 'อันดับ'}แรก ผ่านเข้าสู่รอบถัดไป`;
    }

    return (
        <>
            <div className='mx-auto w-full max-w-5xl px-4 md:px-0 mb-5 text-left'>
                <p className='text-3xl font-bold'>{getTitleString()}</p>
                <p className='text-xl text-default-500 font-medium'>{getProceedingString()}</p>
            </div>
            <div className='mx-auto w-full max-w-5xl px-4 md:px-0 overflow-x-auto pb-4'>
                <Table className='min-w-[800px] lg:min-w-full'>
                    <TableHeader>
                        <TableColumn>#</TableColumn>
                        <TableColumn>{t('name')}</TableColumn>
                        {/* <TableColumn>Region</TableColumn> */}
                        <TableColumn>1</TableColumn>
                        <TableColumn>2</TableColumn>
                        <TableColumn>3</TableColumn>
                        {!isBlindfolded ? <TableColumn>4</TableColumn> : <TableColumn className='hidden'>4</TableColumn>}
                        {!isBlindfolded ? <TableColumn>5</TableColumn> : <TableColumn className='hidden'>5</TableColumn>}
                        {!isBlindfolded ? <TableColumn>{t('average')}</TableColumn> : <TableColumn className='hidden'>Avg</TableColumn>}
                        <TableColumn>{t('best')}</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={t('no_results')}>
                        {allResults.map((result, i) => {
                            const isValued = result.best !== null;
                            let rank = i + 1;
                            let isPassing = false;

                            if (isValued) {
                                if (i > 0) {
                                    const prev = allResults[i - 1];
                                    if (prev.result && prev.result === result.result && prev.best === result.best) {
                                        rank = prev.rank!;
                                    }
                                }
                                result.rank = rank;
                                isPassing = result.result !== null && proceedingCount >= rank;
                            }

                            const cellTextColor = isValued ? '' : 'text-default-400';
                            const rankDisplay = isValued ? (
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${isPassing && result.status === ResultStatus.ACTIVE ? 'bg-success-100 text-success-600 font-bold' : ''}`}>
                                    {rank}
                                </div>
                            ) : (
                                <div className='w-8 h-8 flex items-center justify-center text-default-400'>-</div>
                            );

                            return (
                                <TableRow key={result.id}>
                                    <TableCell>{rankDisplay}</TableCell>
                                    <TableCell className={cellTextColor}>{result.competitor.name}</TableCell>
                                    {/* <TableCell className={cellTextColor}>{result.competitor.region}</TableCell> */}
                                    <TableCell className={cellTextColor}>{result.attempts[0] ? numToFormatted(result.attempts[0], true) : ''}</TableCell>
                                    <TableCell className={cellTextColor}>{result.attempts[1] ? numToFormatted(result.attempts[1], true) : ''}</TableCell>
                                    <TableCell className={cellTextColor}>{result.attempts[2] ? numToFormatted(result.attempts[2], true) : ''}</TableCell>
                                    {!isBlindfolded ? <TableCell className={cellTextColor}>{result.attempts[3] === 0 ? '' : numToFormatted(result.attempts[3], true)}</TableCell> : <></>}
                                    {!isBlindfolded ? <TableCell className={cellTextColor}>{result.attempts[4] === 0 ? '' : numToFormatted(result.attempts[4], true)}</TableCell> : <></>}
                                    {!isBlindfolded ? <TableCell className={`font-semibold ${cellTextColor}`}>{result.result ? numToFormatted(result.result) : ''}</TableCell> : <></>}
                                    <TableCell className={cellTextColor}>{result.best ? numToFormatted(result.best) : ''}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

export default ResultTable;