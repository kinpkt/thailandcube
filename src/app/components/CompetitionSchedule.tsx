'use client';

import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@heroui/react';
import LBCB2026 from '@/data/schedule/LBCB2026.json';
import { useLocale, useTranslations } from 'next-intl';
import { Competition } from '@prisma/client';
import { dateToRange } from '@/lib/DateTimeFormatter';

type ScheduleItem = {
    date_th?: string;
    date_en?: string;
    time?: string;
    event_th?: string;
    event_en?: string;
    format?: string;
    time_limit?: string;
    ranking_th?: string;
    ranking_en?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CompetitionSchedule = ({competition}: {competition: any}) =>
{
    const locale = useLocale();
    const t = useTranslations('CompetitionSchedule');

    return (
        <>
            <h1 className='text-3xl my-5' id='schedule'>{t('schedule')}</h1>
            <Table className='w-[75%] mx-auto' aria-label='Schedule Table' isStriped>
                <TableHeader>
                    <TableColumn>{t('time')}</TableColumn>
                    <TableColumn>{t('activity')}</TableColumn>
                    <TableColumn>{t('format')}</TableColumn>
                    <TableColumn>{t('time_limit')}</TableColumn>
                    <TableColumn>{t('ranking')}</TableColumn>
                </TableHeader>
                <TableBody>
                    {(LBCB2026 as ScheduleItem[]).map((item, index) => {
                        // 1. If it's a Date Header Row
                        if (item[`date_${locale}` as keyof ScheduleItem]) {
                            return (
                                <TableRow key={index} className='bg-primary-100'>
                                    {/* We make one cell specific for the date */}
                                    {/* We span the rest or just put the date in the second cell
                                        Note: HeroUI doesn't support colSpan perfectly in all versions. 
                                        A safer hack for visuals is putting the date in the Event column 
                                        and empty text in others, OR using CSS. 
                                        
                                        However, here is the cleanest visual approach:
                                    */}
                                    <TableCell className='font-bold text-black text-lg' colSpan={5}>
                                        {item[`date_${locale}` as keyof ScheduleItem]}
                                    </TableCell>
                                </TableRow>
                            );
                        }

                        // 2. If it's a standard Event Row
                        return (
                            <TableRow key={index}>
                                <TableCell className='whitespace-nowrap font-medium'>
                                    {item.time}
                                </TableCell>
                                
                                <TableCell>
                                    <div className='flex flex-col'>
                                        <span className='font-bold'>{item[`event_${locale}` as keyof ScheduleItem] ?? item.event_th}</span>
                                        {/* Handle event_2 if it exists */}
                                        {/* {item.event_2 && (
                                            <span className='text-xs text-default-500'>
                                                {item.event_2}
                                            </span>
                                        )} */}
                                    </div>
                                </TableCell>
                                
                                <TableCell>
                                    {item.format || '-'}
                                </TableCell>
                                
                                <TableCell className='text-xs'>
                                    {item.time_limit || '-'}
                                </TableCell>
                                
                                <TableCell className='text-xs'>
                                    {item[`ranking_${locale}` as keyof ScheduleItem] || '-'}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}

export default CompetitionSchedule;