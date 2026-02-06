/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Competitor, Event, EventType, Registration, Round } from '@prisma/client';
import { numToFormatted } from '@/lib/DateTimeFormatter';
import Result from '@/model/Result';
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@heroui/react';
import { useMemo } from 'react';

interface ResultTableRoute
{
    competitionId: string;
    event: EventType;
    roundNumber: number;
}

type RoundWithEventInfo = Round & {
    event: Event
}

type ResultWithCompetitor = Result & {
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
    const isBlindfolded = route.event === EventType.E333BF;
    const totalAttempts = isBlindfolded ? 3 : 5;

    const { valued, blank } = useMemo(() => {
        // Handle null/undefined
        if (!rawResults) return { valued: [], blank: [] };

        // Check if it's the new Object format ({ valued: [...], blank: [...] })
        if ('valued' in rawResults && Array.isArray((rawResults as any).valued)) {
            return rawResults as { valued: ResultWithCompetitor[], blank: ResultWithCompetitor[] };
        }

        // Fallback: Handle Flat Array (Old Format) by splitting it locally
        if (Array.isArray(rawResults)) {
            const flatList = rawResults as ResultWithCompetitor[];
            // Sort simply just to ensure order if the DB didn't
            return {
                valued: flatList.filter(r => r.result !== null && r.result > 0).sort((a,b) => Number(a.result) - Number(b.result)),
                blank: flatList.filter(r => r.result === null || r.result <= 0)
            };
        }

        return { valued: [], blank: [] };
    }, [rawResults]);

    const allResults = useMemo(() => [...valued, ...blank], [valued, blank]);

    // const renderResultData = results.map((result, i) =>
    // {
    //     let proceedingCount = 0;

    //     if (roundDetails?.proceed && Number.isInteger(roundDetails?.proceed))
    //         proceedingCount = roundDetails?.proceed;
    //     else if (roundDetails?.proceed)
    //         proceedingCount = roundDetails?.proceed*results.length;

    //     let rank =  i + 1;
    //     if (i > 0) 
    //     {
    //         const prev = results[i - 1];
    //         if (prev.result === result.result && prev.best === result.best)
    //             rank = prev.rank!;
    //     }

    //     result.rank = rank;

    //     const attemptCells = Array.from({ length: totalAttempts }).map((_, idx) => {
    //         const val = result.attempts[idx];
    //         return (val !== undefined && val !== 0) ? numToFormatted(val) : '';
    //     });

    //     return (
    //         <TableRow key={i}>
    //             <TableCell className={(result.result && proceedingCount >= rank) ? 'bg-pass' : ''}>{rank}</TableCell>
    //             <TableCell>{result.competitor.name}</TableCell>
    //             <TableCell>{result.competitor.region}</TableCell>
                
    //             {/* 3. Render Attempt Cells individually to satisfy column count */}
    //             {attemptCells.map((val, idx) => (
    //                 <TableCell key={`att-${idx}`}>{val}</TableCell>
    //             ))}

    //             {/* 4. Conditionally Render Average Cell */}
    //             {!isBlindfolded && (
    //                 <TableCell>{result.result ? numToFormatted(result.result) : ''}</TableCell>
    //             )}
                
    //             <TableCell>{result.best ? numToFormatted(result.best) : ''}</TableCell>
    //         </TableRow>
    //     );
    // })

    const totalParticipants = valued.length + blank.length;
    let proceedingCount = 0;
    if (roundDetails?.proceed && Number.isInteger(roundDetails?.proceed))
        proceedingCount = roundDetails?.proceed;
    else if (roundDetails?.proceed)
        proceedingCount = Math.floor(roundDetails?.proceed * totalParticipants);

    return (
        <>
            <Table className='mx-auto w-2xl'>
                <TableHeader>
                    <TableColumn>#</TableColumn>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Region</TableColumn>
                    <TableColumn>1</TableColumn>
                    <TableColumn>2</TableColumn>
                    <TableColumn>3</TableColumn>
                    {!isBlindfolded ? <TableColumn>4</TableColumn> : <TableColumn className='hidden'>4</TableColumn>}
                    {!isBlindfolded ? <TableColumn>5</TableColumn> : <TableColumn className='hidden'>5</TableColumn>}
                    {!isBlindfolded ? <TableColumn>Average</TableColumn> : <TableColumn className='hidden'>Avg</TableColumn>}
                    <TableColumn>Best</TableColumn>
                </TableHeader>
                <TableBody emptyContent={'No Results'}>
                    {/* USE allResults here (Safe combined array) */}
                    {allResults.map((result, i) => {
                        // 3. DETERMINE RANKING STATUS based on normalized lists
                        const isValued = i < valued.length;
                        let rank = i + 1;
                        let isPassing = false;

                        if (isValued) {
                            if (i > 0) {
                                const prev = allResults[i - 1];
                                // Rank checks
                                if (prev.result && prev.result > 0 && prev.result === result.result && prev.best === result.best) {
                                    rank = prev.rank!;
                                }
                            }
                            result.rank = rank;
                            isPassing = result.result !== null && proceedingCount >= rank;
                        }

                        const cellTextColor = isValued ? '' : 'text-default-400';
                        const rankDisplay = isValued ? (
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${isPassing ? 'bg-success-100 text-success-600 font-bold' : ''}`}>
                                {rank}
                            </div>
                        ) : (
                            <div className='w-8 h-8 flex items-center justify-center text-default-400'>-</div>
                        );

                        return (
                            <TableRow key={i}>
                                <TableCell>{rankDisplay}</TableCell>
                                <TableCell className={cellTextColor}>{result.competitor.name}</TableCell>
                                <TableCell className={cellTextColor}>{result.competitor.region}</TableCell>
                                <TableCell className={cellTextColor}>{result.attempts[0] ? numToFormatted(result.attempts[0], true) : ''}</TableCell>
                                <TableCell className={cellTextColor}>{result.attempts[1] ? numToFormatted(result.attempts[1], true) : ''}</TableCell>
                                <TableCell className={cellTextColor}>{result.attempts[2] ? numToFormatted(result.attempts[2], true) : ''}</TableCell>
                                {!isBlindfolded ? <TableCell className={cellTextColor}>{result.attempts[3] === 0 ? '' : numToFormatted(result.attempts[3], true)}</TableCell> : <></>}
                                {!isBlindfolded ? <TableCell className={cellTextColor}>{result.attempts[4] === 0 ? '' : numToFormatted(result.attempts[4], true)}</TableCell> : <></>}
                                {!isBlindfolded ? <TableCell className={`font-semibold ${cellTextColor}`}>{result.result ? numToFormatted(result.result) : ''}</TableCell> : <></>}
                                <TableCell className={`font-bold ${cellTextColor}`}>{result.best ? numToFormatted(result.best) : ''}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}

export default ResultTable;