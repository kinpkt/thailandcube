'use client';

import { Competitor, EventType, Round } from '@/generated/prisma';
import { numToFormatted } from '@/lib/DateTimeFormatter';
import Result from '@/model/Result';
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@heroui/react';

interface ResultTableRoute
{
    competitionId: string;
    event: EventType;
    roundNumber: number;
}

type ExtendedResult = Result &
{
    competitor: Competitor;
    rank?: number;
}

interface ResultTableProps
{
    results: ExtendedResult[];
    roundDetail: Round | null;
    route: ResultTableRoute;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResultTable = ({results, roundDetail, route}: ResultTableProps) =>
{
    const renderResultData = results.map((result, i) =>
    {
        let proceedingCount = 0;

        if (roundDetail?.proceed && Number.isInteger(roundDetail?.proceed))
            proceedingCount = roundDetail?.proceed;
        else if (roundDetail?.proceed)
            proceedingCount = roundDetail?.proceed*results.length;

        let rank = i + 1;
        if (i > 0) 
        {
            const prev = results[i - 1];
            if (prev.result === result.result && prev.best === result.best)
                rank = prev.rank!;
        }

        result.rank = rank;

        return (
            <TableRow key={i}>
                <TableCell className={(result.result && proceedingCount >= rank) ? 'bg-pass' : ''}>{rank}</TableCell>
                <TableCell>{result.competitor.name}</TableCell>
                <TableCell>{result.competitor.region}</TableCell>
                {
                    result.attempts.length === 0 ? 
                    <TableCell colSpan={5}>{''}</TableCell> :
                    (
                        <>
                            {result.attempts.map((a, j) => <TableCell key={j}>{a === 0 ? '' : numToFormatted(a)}</TableCell>)}
                        </>
                    )
                }
                <TableCell>{result.result ? numToFormatted(result.result) : ''}</TableCell>
                <TableCell>{result.best ? numToFormatted(result.best) : ''}</TableCell>
            </TableRow>
        );
    })

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
                    {route.event === EventType.E333BF ? <></> : <TableColumn>4</TableColumn>}
                    {route.event === EventType.E333BF as EventType ? <></> : <TableColumn>5</TableColumn>}
                    {route.event === EventType.E333BF as EventType ? <></> : <TableColumn>Average</TableColumn>}
                    <TableColumn>Best</TableColumn>
                </TableHeader>
                <TableBody emptyContent={'No Results'}>
                    {results.length === 0 ?  <TableRow><TableCell colSpan={10} className='text-center'>No Results</TableCell></TableRow> : renderResultData}
                </TableBody>
            </Table>
        </>
    );
}

export default ResultTable;