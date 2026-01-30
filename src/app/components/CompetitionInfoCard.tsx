'use client';

import { Competition } from '@prisma/client';
import { dateToRange } from '@/lib/DateTimeFormatter';
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import LBCB2026 from '@/data/schedule/LBCB2026.json';

type ScheduleItem = {
    date?: string;
    time?: string;
    event?: string;
    format?: string;
    time_limit?: string;
    ranking?: string;
};

const CompetitionInfoCard = ({competition, isWCA}: {competition: Competition | null, isWCA: boolean | undefined}) =>
{
    const t = useTranslations('CompetitionInfo');
    const locale = useLocale();

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const formatMarkdownHyperlink = (string: string) =>
    {
        const regex = /\[([^\]]+)\]\(([^)]+)\)/;

        const match = string.match(regex);

        if (match) 
        {
            const text = match[1];
            const url = match[2];
            return {text, url};
        }
        else 
        {
            return string
        }
    }

    if (competition)
    {
        const markdownData = formatMarkdownHyperlink(competition.venue);

        return (
            <>
                <Card className='max-w-[400px] mx-auto mb-5'>
                    <CardHeader className='flex gap-3'>
                        {
                            isWCA ? (
                                <Image alt='WCA Logo' height={40} radius='sm' src='/img/wca.svg' width={40}/>
                            ) :
                            (<Image alt='ThailandCube Logo' height={40} radius='sm' src='/img/thailandcube.svg' width={40}/>)
                        }
                        <div className='flex flex-col'>
                            <p className='text-2xl font-bold'>{isWCA ? t('wca') : t('non_wca')}</p>
                        </div>
                    </CardHeader>
                    <Divider/>
                    <CardBody>
                        <p className='text-xl font-bold'>{competition.name}</p>
                        <p className='text-small text-default-500'>@{ (typeof markdownData === 'string' ? markdownData : markdownData.text) ?? competition.venue }</p>
                        <p>Date: {dateToRange(competition.startDate, competition.endDate)}</p>
                    </CardBody>
                    <Divider/>
                    <CardFooter>
                        { !isWCA ? <Button color='success' variant='flat' as={Link} href='https://docs.google.com/forms/d/e/1FAIpQLSfizf8EuVAvcKO86AamWJyAEmjXgHHIT08LOvTG3cr6zz3exA/viewform?usp=header'>{t('register')}</Button> : <></>}
                        <Button color='primary' variant='flat' className={!isWCA ? 'mx-2' : ''} as={Link} href={isWCA ? `https://www.worldcubeassociation.org/competitions/${competition.competitionId}` : `/${competition.competitionId}`}>{t('details')}</Button>
                    </CardFooter>
                </Card>

                <Modal className='w-auto' isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                        {
                            (onClose) =>
                            (
                                <>
                                    <ModalHeader>{competition.name}</ModalHeader>
                                    <ModalBody>
                                        <Table aria-label='Schedule Table' isStriped>
                                            <TableHeader>
                                                <TableColumn>TIME</TableColumn>
                                                <TableColumn>EVENT</TableColumn>
                                                <TableColumn>FORMAT</TableColumn>
                                                <TableColumn>LIMIT</TableColumn>
                                                <TableColumn>PROC.</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {(LBCB2026 as ScheduleItem[]).map((item, index) => {
                                                    // 1. If it's a Date Header Row
                                                    if (item.date) {
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
                                                                    {item.date}
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
                                                                    <span className='font-bold'>{item.event}</span>
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
                                                                {item.ranking || '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color='danger' variant='light' onPress={onClose}>
                                            Close
                                        </Button>
                                    </ModalFooter>
                                </>
                            )
                        }
                    </ModalContent>
                </Modal>
            </>
        );
    }
}

export default CompetitionInfoCard;