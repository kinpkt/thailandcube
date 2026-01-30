/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { 
    Input, 
    Button, 
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell, 
    Autocomplete, 
    AutocompleteItem,
    Card,
    CardBody
} from '@heroui/react';
import { numToFormatted, formattedToNum } from '@/lib/DateTimeFormatter';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EventType, Round, Result, Competitor } from '@prisma/client';
import axios from 'axios';
import { calculateAo5, calculateBo3 } from '@/lib/Calculation';

// ----------------------------------------------------------------------
// NEW TYPES FOR NORMALIZED SCHEMA
// ----------------------------------------------------------------------

// We need to extend the basic Round type because in the new schema,
// 'eventId' is just a number (e.g., 45). To know if it is 333BF, 
// we must access the nested 'event' relation.
type RoundWithEventInfo = Round & {
    event: {
        event: EventType; // This holds the Enum (e.g. "E333BF")
    }
}

// Ensure the results passed in actually have the competitor data attached
type ResultWithCompetitor = Result & {
    rank?: number;
    competitor: Competitor;
}

interface ScoretakerPanelProps 
{
    results: ResultWithCompetitor[];    
    eventDetail: RoundWithEventInfo | null;
}

interface ExtendedCompetitor extends Competitor 
{
    rank?: number;
    formattedString: string;
}

const ScoretakerPanel = ({ results, eventDetail }: ScoretakerPanelProps) => 
{
    const router = useRouter();

    const [competitors, setCompetitors] = useState<ExtendedCompetitor[]>(
        results.map(r => r.competitor).filter((c): c is Competitor => !!c)
        .map(c => ({
            ...c,
            formattedString: `${c.name} (${c.wcaId || c.id})`, // Updated to show WCA ID if available
        }))
    );
    const [competitorID, setCompetitorID] = useState<number | null>(null);
    
    // Inputs
    const [a1, setA1] = useState<string>('');
    const [disabledA1, setDisabledA1] = useState<boolean>(false);
    const [a2, setA2] = useState<string>('');
    const [disabledA2, setDisabledA2] = useState<boolean>(false);
    const [a3, setA3] = useState<string>('');
    const [disabledA3, setDisabledA3] = useState<boolean>(false);
    const [a4, setA4] = useState<string>('');
    const [disabledA4, setDisabledA4] = useState<boolean>(false);
    const [a5, setA5] = useState<string>('');
    const [disabledA5, setDisabledA5] = useState<boolean>(false);
    const [disabledCutoff, setDisabledCutoff] = useState<boolean>(false);

    // ----------------------------------------------------------------------
    // SCHEMA FIX: CHECK EVENT TYPE VIA NESTED RELATION
    // ----------------------------------------------------------------------
    const isBlindfolded = eventDetail?.event.event === EventType.E333BF;

    const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const form = event.currentTarget.closest('form');
        if (!form) return;

        const focusableElements = Array.from(form.querySelectorAll(`input:not([disabled]), button[type='submit']`)) as HTMLElement[];
        const currentIndex = focusableElements.indexOf(event.currentTarget);

        if (event.key === 'Enter') {
            let nextIndex = currentIndex + 1;

            // Logic for Cutoff
            if (disabledCutoff && currentIndex === 3 && eventDetail?.cutoff && !isBlindfolded) {
                 nextIndex = focusableElements.length - 1;
            }

            // Logic for Cumulative Time Limit (333bf)
            if (isBlindfolded) {
                const time = [formattedToNum(a1), formattedToNum(a2), formattedToNum(a3)];
                const timeSum = time.reduce((a, b) => a + b, 0);
                const valSetters = [setA1, setA2, setA3, setA4, setA5];

                if (!time.some(t => t < 0)) {
                    if (timeSum >= eventDetail.timeLimit) {
                        nextIndex = focusableElements.length - 1; 

                        const attemptIndex = currentIndex - 1; 
                        for (let i = attemptIndex - 2; i < 3; i++) {
                            if(i >= 0 && i < valSetters.length) valSetters[i]('DNS');
                        }
                        if(attemptIndex - 2 >= 0) valSetters[attemptIndex - 2]('DNF');
                    }
                }
            }

            if (nextIndex < focusableElements.length) {
                focusableElements[nextIndex]?.focus();
            }
            event.preventDefault();
        } 
        else if (event.key === '/' || event.key === '*') {
            event.preventDefault();
            const value = event.key === '/' ? 'DNF' : 'DNS';
            
            const index = focusableElements.indexOf(event.currentTarget);
            
            // Note: Indices based on DOM order: 0=Autocomplete, 1=A1, etc.
            switch (index) {
                case 1: setA1(value); break;
                case 2: setA2(value); break;
                case 3: setA3(value); break;
                case 4: setA4(value); break;
                case 5: setA5(value); break;
            }
        }
    };

    const handleCompetitorChange = (key: React.Key | null) => {
        if (key) {
            const id = Number(key);
            setCompetitorID(id);
            
            // Logic to pre-fill existing data if editing
            clearFields();
            const oldResult = results.find((r) => r.competitor.id === id)?.attempts;

            if (oldResult && oldResult?.length > 0) {
                setA1(numToFormatted(oldResult[0]));
                setA2(numToFormatted(oldResult[1]));
                setA3(numToFormatted(oldResult[2]));
                setA4(numToFormatted(oldResult[3]));
                setA5(numToFormatted(oldResult[4]));
            }
        } else {
            setCompetitorID(null);
            clearFields();
        }
    };

    const formatTime = (input: string) => {
        let time: string;
        const digits = input.replace(/[^\d]/g, '');
        if (!digits) time = '';

        if (digits.length <= 2)
            time = `0.${digits.padStart(2, '0')}`;
        else if (digits.length <= 4) {
            const seconds = digits.slice(0, -2);
            const ms = digits.slice(-2);
            time = `${parseInt(seconds)}.${ms}`;
        }
        else {
            const minutes = parseInt(digits.slice(0, -4), 10);
            const secPart = digits.slice(-4);
            const seconds = secPart.slice(0, 2);
            const ms = secPart.slice(2);
            time = `${minutes}:${seconds}.${ms}`;
        }

        if (eventDetail?.timeLimit && formattedToNum(time) >= eventDetail.timeLimit)
            time = 'DNF';

        return time;
    };

    const handleSubmitResult = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!competitorID || competitorID <= 0) {
            alert('Missing competitor information.');
            return;
        }

        const currentAttempts = isBlindfolded ? [a1, a2, a3].map(a => formattedToNum(a)) : [a1, a2, a3, a4, a5].map(a => formattedToNum(a));
        let result, best;

        if (isBlindfolded)
            best = result = calculateBo3(currentAttempts);
        else
            ({ best, result } = calculateAo5(currentAttempts, !(!eventDetail?.cutoff)));

        const submittedData = {
            // SCHEMA FIX: Send the Round ID directly (safest for updates)
            roundId: eventDetail?.id,
            
            // Fallbacks for API logic
            eventEnum: eventDetail?.event.event,
            eventRound: eventDetail?.round,
            
            competitorID,
            attempts: currentAttempts,
            result,
            best
        };

        console.log('Submitting:', submittedData);
        await axios.post('/api/results', submittedData);

        clearFields();
        setCompetitorID(null); 
        router.refresh();
    };

    const clearFields = () => {
        setA1(''); setA2(''); setA3(''); setA4(''); setA5('');
        setDisabledA1(false); setDisabledA2(false); setDisabledA3(false);
        setDisabledA4(false); setDisabledA5(false); setDisabledCutoff(false);
    };

    useEffect(() => {
        if (!localStorage.getItem('username')) {
            router.push('/');
            return;
        }
    }, [router]);

    // Cutoff Validation Logic
    useEffect(() => {
        // Fix: Use eventDetail.event.event to check type, use eventDetail.cutoff for logic
        if (eventDetail?.cutoff && eventDetail.event.event !== EventType.E333BF)
            setDisabledCutoff((formattedToNum(a1) <= -1 && formattedToNum(a2) <= -1) || (formattedToNum(a1) >= eventDetail.cutoff && formattedToNum(a2) >= eventDetail.cutoff));
    }, [a1, a2, eventDetail]);

    // Cumulative Time Limit Logic
    useEffect(() => {
        if (eventDetail?.event.event === EventType.E333BF) {
            const time = [formattedToNum(a1), formattedToNum(a2), formattedToNum(a3)];
            const attemptsCount = time.filter(t => t > 0).length;
            const timeSum = time.reduce((a, b) => a + b, 0);
            const valSetters = [setA1, setA2, setA3, setA4, setA5];

            if (!time.some(t => t < 0)) {
                if (timeSum >= eventDetail.timeLimit) {
                    for (let i = attemptsCount - 1; i < 3; i++) {
                        valSetters[i]('DNS');
                    }
                    valSetters[attemptsCount - 1]('DNF');
                }
            }
        }
    }, [a1, a2, a3, eventDetail]);

    if (!results || results.length === 0) return null;

    return (
        <div className='w-full p-6'>
            <div className='flex flex-col lg:flex-row gap-8'>
                {/* Input Section */}
                <div className='w-full lg:w-1/3'>
                    <Card className='bg-default-50'>
                        <CardBody className='p-6'>
                            <form className='flex flex-col gap-4' onSubmit={handleSubmitResult}>
                                <h3 className='text-xl font-bold mb-2'>
                                    {eventDetail?.event.event} - Round {eventDetail?.round}
                                </h3>
                                
                                <Autocomplete
                                    label='Competitor'
                                    placeholder='Search competitor...'
                                    defaultItems={competitors}
                                    onSelectionChange={handleCompetitorChange}
                                    selectedKey={competitorID ? String(competitorID) : null}
                                    onKeyDown={handleEnter}
                                    allowsCustomValue={false}
                                >
                                    {(item) => <AutocompleteItem key={item.id}>{item.formattedString}</AutocompleteItem>}
                                </Autocomplete>

                                <Input 
                                    label='Attempt 1' 
                                    value={a1} 
                                    onKeyDown={handleEnter} 
                                    onChange={(e) => setA1(formatTime(e.target.value))} 
                                    isDisabled={disabledA1} 
                                    variant='bordered'
                                />
                                <Input 
                                    label='Attempt 2' 
                                    value={a2} 
                                    onKeyDown={handleEnter} 
                                    onChange={(e) => setA2(formatTime(e.target.value))} 
                                    isDisabled={disabledA2} 
                                    variant='bordered'
                                />
                                <Input 
                                    label='Attempt 3' 
                                    value={a3} 
                                    onKeyDown={handleEnter} 
                                    onChange={(e) => setA3(formatTime(e.target.value))} 
                                    isDisabled={disabledA3 || disabledCutoff} 
                                    variant='bordered'
                                />
                                
                                {!isBlindfolded && (
                                    <>
                                        <Input 
                                            label='Attempt 4' 
                                            value={a4} 
                                            onKeyDown={handleEnter} 
                                            onChange={(e) => setA4(formatTime(e.target.value))} 
                                            isDisabled={disabledA4 || disabledCutoff} 
                                            variant='bordered'
                                        />
                                        <Input 
                                            label='Attempt 5' 
                                            value={a5} 
                                            onKeyDown={handleEnter} 
                                            onChange={(e) => setA5(formatTime(e.target.value))} 
                                            isDisabled={disabledA5 || disabledCutoff} 
                                            variant='bordered'
                                        />
                                    </>
                                )}

                                <div className='text-sm text-default-500 mt-2'>
                                    <p>Time Limit: {numToFormatted(eventDetail?.timeLimit)} {isBlindfolded ? 'in total' : ''}</p>
                                    <p>Cutoff: {eventDetail?.cutoff ? numToFormatted(eventDetail.cutoff) : 'None'}</p>
                                </div>

                                <Button color='warning' className='mt-2 font-semibold' type='submit'>
                                    Submit
                                </Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>

                {/* Table Section */}
                <div className='w-full lg:w-2/3'>
                    <Table aria-label='Results Table' isStriped>
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
                            {results.map((result, i) => {
                                let proceedingCount = 0;

                                if (eventDetail?.proceed && Number.isInteger(eventDetail?.proceed))
                                    proceedingCount = eventDetail?.proceed;
                                else if (eventDetail?.proceed)
                                    proceedingCount = Math.floor(eventDetail?.proceed * results.length);

                                let rank = i + 1;
                                if (i > 0) {
                                    const prev = results[i - 1];
                                    if (prev.result === result.result && prev.best === result.best)
                                        rank = prev.rank!; // Note: ensure 'rank' is handled in your Result type or mapped beforehand
                                }

                                // Extend result object locally for rendering
                                const extendedResult = { ...result, rank };
                                const isPassing = extendedResult.result && proceedingCount >= rank;

                                return (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${isPassing ? 'bg-success-100 text-success-600 font-bold' : ''}`}>
                                                {rank}
                                            </div>
                                        </TableCell>
                                        <TableCell>{extendedResult.competitor.name}</TableCell>
                                        <TableCell>{extendedResult.competitor.region}</TableCell>
                                        <TableCell>{extendedResult.attempts[0] === 0 ? '' : numToFormatted(extendedResult.attempts[0])}</TableCell>
                                        <TableCell>{extendedResult.attempts[1] === 0 ? '' : numToFormatted(extendedResult.attempts[1])}</TableCell>
                                        <TableCell>{extendedResult.attempts[2] === 0 ? '' : numToFormatted(extendedResult.attempts[2])}</TableCell>
                                        
                                        {!isBlindfolded ? <TableCell>{extendedResult.attempts[3] === 0 ? '' : numToFormatted(extendedResult.attempts[3])}</TableCell> : <></>}
                                        {!isBlindfolded ? <TableCell>{extendedResult.attempts[4] === 0 ? '' : numToFormatted(extendedResult.attempts[4])}</TableCell> : <></>}
                                        {!isBlindfolded ? <TableCell className='font-semibold'>{extendedResult.result ? numToFormatted(extendedResult.result) : ''}</TableCell> : <></>}
                                        
                                        <TableCell className='font-bold'>{extendedResult.best ? numToFormatted(extendedResult.best) : ''}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default ScoretakerPanel;