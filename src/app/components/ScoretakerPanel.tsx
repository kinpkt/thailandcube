/* eslint-disable @typescript-eslint/no-explicit-any */
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
    CardBody,
    addToast
} from '@heroui/react';
import { numToFormatted, formattedToNum } from '@/lib/DateTimeFormatter';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventType, Round, Result, Competitor, Registration } from '@prisma/client';
import { calculateAo5, calculateBo3 } from '@/lib/Calculation';
import { EventCodeToFullMap } from '@/lib/EnumMapping';
import { CheckIcon } from '@heroicons/react/16/solid';
import { submitRoundResult } from '../actions/results';

type RoundWithEventInfo = Round & {
    event: Event
}

type ResultWithCompetitor = Result & {
    rank?: number;
    competitor: Competitor & {registrations: Registration[]};
}

interface ScoretakerPanelProps {
    results: ResultWithCompetitor[] | {valued: ResultWithCompetitor[], blank: ResultWithCompetitor[]};
    roundDetails: RoundWithEventInfo | null;
}

interface ExtendedCompetitor extends Competitor {
    rank?: number;
    formattedString: string;
    registrationId: number | string;
}

const ScoretakerPanel = ({ results: rawResults, roundDetails }: ScoretakerPanelProps) => {
    const router = useRouter();

    // 1. ROBUST DATA NORMALIZATION
    // This fixes the crash by handling both Flat Arrays (old) and Split Objects (new)
    const { valued, blank } = useMemo(() => {
        // Handle null/undefined
        if (!rawResults) return { valued: [], blank: [] };

        let flatList: ResultWithCompetitor[] = [];

        // Check if it's the new Object format ({ valued: [...], blank: [...] })
        if ('valued' in rawResults && Array.isArray((rawResults as any).valued)) {
            // Merge them first so we can re-sort everything according to your specific logic
            const objResults = rawResults as { valued: ResultWithCompetitor[], blank: ResultWithCompetitor[] };
            flatList = [...objResults.valued, ...objResults.blank];
        }
        // Fallback: Handle Flat Array (Old Format)
        else if (Array.isArray(rawResults)) {
            flatList = rawResults as ResultWithCompetitor[];
        }

        // Apply Sorting Logic
        return {
            // 1. Positive Reals (standard ascending sort)
            valued: flatList
                .filter(r => r.result !== null && r.result > 0)
                .sort((a, b) => Number(a.result) - Number(b.result)),

            // 2. Negatives (tiebreak by best) then Nulls
            blank: flatList
                .filter(r => r.result === null || r.result <= 0)
                .sort((a, b) => {
                    // Step A: Separate defined values (negatives) from nulls
                    // If a.result is a number (<=0) and b.result is null, A comes first
                    if (a.result !== null && b.result === null) return -1;
                    if (a.result === null && b.result !== null) return 1;
                    if (a.result === null && b.result === null) return 0;

                    // Step B: Both are Negative numbers (DNF/DNS/etc)
                    // Tiebreak using the 'best' field (Ascending: lower best is better)
                    
                    // Normalize 'best': if best is <= 0 or null, treat it as Infinity for sorting
                    const bestA = (a.best !== null && a.best > 0) ? a.best : Infinity;
                    const bestB = (b.best !== null && b.best > 0) ? b.best : Infinity;

                    return bestA - bestB;
                })
        };
    }, [rawResults]);

    // 2. Derive combined list for Autocomplete and Table
    const allResults = useMemo(() => [...valued, ...blank], [valued, blank]);

    const [competitors, setCompetitors] = useState<ExtendedCompetitor[]>([]);

    // Update competitors when data changes (wrapped in useEffect to avoid hydration mismatches)
    useEffect(() => {
        setCompetitors(
            allResults
                .map(r => r.competitor)
                .filter((c): c is ResultWithCompetitor['competitor'] => !!c)
                .map(c => {
                    const currentRegistration = c.registrations.find(
                        (reg) => reg.competitionId === roundDetails?.event.competitionId
                    );
                    const regId = currentRegistration ? currentRegistration.id : 'N/A';
                    return {
                        ...c,
                        registrationId: regId,
                        formattedString: `${c.name} (${regId})`,
                    };
                })
        );
    }, [allResults, roundDetails]);

    const [competitorId, setCompetitorId] = useState<number | null>(null);
    
    // ... [Input States - No Changes Needed] ...
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

    const isBlindfolded = roundDetails?.event.event === EventType.E333BF;

    // ... [Handle Enter/Keys - No Changes Needed] ...
    const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const form = event.currentTarget.closest('form');
        if (!form) return;
        const focusableElements = Array.from(form.querySelectorAll(`input:not([disabled]), button[type='submit']`)) as HTMLElement[];
        const currentIndex = focusableElements.indexOf(event.currentTarget);
        if (event.key === 'Enter') {
            let nextIndex = currentIndex + 1;
            if (disabledCutoff && currentIndex === 3 && roundDetails?.cutoff && !isBlindfolded) nextIndex = focusableElements.length - 1;
            if (isBlindfolded) {
                const time = [formattedToNum(a1), formattedToNum(a2), formattedToNum(a3)];
                const timeSum = time.reduce((a, b) => a + b, 0);
                const valSetters = [setA1, setA2, setA3, setA4, setA5];
                if (!time.some(t => t < 0)) {
                    if (timeSum >= roundDetails.timeLimit) {
                        nextIndex = focusableElements.length - 1; 
                        const attemptIndex = currentIndex - 1; 
                        for (let i = attemptIndex - 2; i < 3; i++) {
                            if(i >= 0 && i < valSetters.length) valSetters[i]('DNS');
                        }
                        if(attemptIndex - 2 >= 0) valSetters[attemptIndex - 2]('DNF');
                    }
                }
            }
            if (nextIndex < focusableElements.length) focusableElements[nextIndex]?.focus();
            event.preventDefault();
        } else if (event.key === '/' || event.key === '*') {
            event.preventDefault();
            const value = event.key === '/' ? 'DNF' : 'DNS';
            const index = focusableElements.indexOf(event.currentTarget);
            switch (index) {
                case 1: setA1(value); break;
                case 2: setA2(value); break;
                case 3: setA3(value); break;
                case 4: setA4(value); break;
                case 5: setA5(value); break;
            }
        }
    };

    const handleCompetitorChange = (key: React.Key | null) => 
    {
        if (key) 
        {
            const id = Number(key);
            setCompetitorId(id);
            clearFields();
            // Search in normalized `allResults`
            const oldResult = allResults.find((r) => r.competitor.id === id)?.attempts;

            if (oldResult && oldResult?.length > 0) 
            {
                setA1(numToFormatted(oldResult[0]));
                setA2(numToFormatted(oldResult[1]));
                setA3(numToFormatted(oldResult[2]));
                setA4(numToFormatted(oldResult[3]));
                setA5(numToFormatted(oldResult[4]));
            }
        } 
        else 
        {
            setCompetitorId(null);
            clearFields();
        }
    };

    const formatTime = (input: string) => 
    {
        let time: string;
        const digits = input.replace(/[^\d]/g, '');

        if (!digits) 
            time = '';
        if (digits.length <= 2) 
            time = `0.${digits.padStart(2, '0')}`;
        
        else if (digits.length <= 4) 
        {
            const seconds = digits.slice(0, -2);
            const ms = digits.slice(-2);
            time = `${parseInt(seconds)}.${ms}`;
        } 
        else 
        {
            const minutes = parseInt(digits.slice(0, -4), 10);
            const secPart = digits.slice(-4);
            const seconds = secPart.slice(0, 2);
            const ms = secPart.slice(2);
            time = `${minutes}:${seconds}.${ms}`;
        }
        if (roundDetails?.timeLimit && formattedToNum(time) >= roundDetails.timeLimit) time = 'DNF';
        return time;
    };

    const handleSubmitResult = async (e: React.FormEvent<HTMLFormElement>) => 
    {
        e.preventDefault();
        if (!competitorId || competitorId <= 0) 
        {
            alert('Missing competitor information.');
            return;
        }
        const currentAttempts = isBlindfolded ? [a1, a2, a3].map(a => formattedToNum(a)) : [a1, a2, a3, a4, a5].map(a => formattedToNum(a));
        let result, best;
        if (isBlindfolded) 
            best = result = calculateBo3(currentAttempts);
        else ({ best, result } = calculateAo5(currentAttempts, !(!roundDetails?.cutoff)));

        const submittedData = {
            roundId: roundDetails?.id,
            event: roundDetails?.event.maxAge ? `${roundDetails?.event.event}-${roundDetails.event.maxAge}` : `${roundDetails?.event.event}`,
            round: roundDetails?.round,
            competitorId,
            attempts: currentAttempts,
            result,
            best
        };

        await submitRoundResult({data: submittedData, roundDetails});
        
        addToast({title: 'เพิ่มผลการแข่งขันสำเร็จ', color: 'success', icon: (<CheckIcon/>)})
        clearFields();
        setCompetitorId(null); 
        router.refresh();
    };

    const clearFields = () => 
    {
        setA1('');
        setA2('');
        setA3('');
        setA4('');
        setA5('');
        setDisabledA1(false);
        setDisabledA2(false);
        setDisabledA3(false);
        setDisabledA4(false); 
        setDisabledA5(false); 
        setDisabledCutoff(false);
    };

    const getAgeSuffix = (maxAge: number | null | undefined) => 
    {
        if (!maxAge)
            return '';
        else
            return `(U${maxAge})`;
    }

    useEffect(() => 
    {
        if (!localStorage.getItem('username')) 
        {
            router.push('/');
            return;
        }
    }, [router]);

    useEffect(() => 
    {
        if (roundDetails?.cutoff && roundDetails.event.event !== EventType.E333BF)
            setDisabledCutoff((formattedToNum(a1) <= -1 && formattedToNum(a2) <= -1) || (formattedToNum(a1) >= roundDetails.cutoff && formattedToNum(a2) >= roundDetails.cutoff));
    }, [a1, a2, roundDetails]);

    useEffect(() => {
        if (roundDetails?.event.event === EventType.E333BF) {
            const time = [formattedToNum(a1), formattedToNum(a2), formattedToNum(a3)];
            const attemptsCount = time.filter(t => t > 0).length;
            const timeSum = time.reduce((a, b) => a + b, 0);
            const valSetters = [setA1, setA2, setA3, setA4, setA5];
            if (!time.some(t => t < 0)) {
                if (timeSum >= roundDetails.timeLimit) {
                    for (let i = attemptsCount - 1; i < 3; i++) valSetters[i]('DNS');
                    valSetters[attemptsCount - 1]('DNF');
                }
            }
        }
    }, [a1, a2, a3, roundDetails]);

    if (!rawResults) return null; // Safe exit

    const filterCompetitors = (textValue: string, inputValue: string) => {
        if (!textValue) return false;
        return textValue.toLowerCase().includes(inputValue.toLowerCase());
    };

    // Calculate proceeding count based on VALID results count or TOTAL? 
    // Usually based on total participants.
    const totalParticipants = valued.length + blank.length;
    let proceedingCount = roundDetails?.proceed ? 0 : 3;
    if (roundDetails?.proceed && Number.isInteger(roundDetails?.proceed))
        proceedingCount = roundDetails?.proceed;
    else if (roundDetails?.proceed)
        proceedingCount = Math.floor(roundDetails?.proceed * totalParticipants);

    return (
        <div className='w-full p-6'>
            <div className='flex flex-col lg:flex-row gap-8'>
                <div className='w-full lg:w-1/3'>
                    <Card className='bg-default-50'>
                        <CardBody className='p-6'>
                            <form className='flex flex-col gap-4' onSubmit={handleSubmitResult}>
                                <h3 className='text-xl font-bold mb-2'>
                                    {EventCodeToFullMap[roundDetails?.event.event as EventType]} {getAgeSuffix(roundDetails?.event.maxAge)} - Round {roundDetails?.round}
                                </h3>
                                <Autocomplete
                                    label='Competitor'
                                    placeholder='Search competitor...'
                                    defaultItems={competitors}
                                    onSelectionChange={handleCompetitorChange}
                                    selectedKey={competitorId ? String(competitorId) : null}
                                    onKeyDown={handleEnter}
                                    allowsCustomValue={false}
                                    defaultFilter={filterCompetitors}
                                >
                                    {(item) => <AutocompleteItem key={item.id} textValue={item.formattedString}>{item.formattedString}</AutocompleteItem>}
                                </Autocomplete>

                                <Input label='Attempt 1' value={a1} onKeyDown={handleEnter} onChange={(e) => setA1(formatTime(e.target.value))} isDisabled={disabledA1} variant='bordered'/>
                                <Input label='Attempt 2' value={a2} onKeyDown={handleEnter} onChange={(e) => setA2(formatTime(e.target.value))} isDisabled={disabledA2} variant='bordered'/>
                                <Input label='Attempt 3' value={a3} onKeyDown={handleEnter} onChange={(e) => setA3(formatTime(e.target.value))} isDisabled={disabledA3 || disabledCutoff} variant='bordered'/>
                                
                                {!isBlindfolded && (
                                    <>
                                        <Input label='Attempt 4' value={a4} onKeyDown={handleEnter} onChange={(e) => setA4(formatTime(e.target.value))} isDisabled={disabledA4 || disabledCutoff} variant='bordered'/>
                                        <Input label='Attempt 5' value={a5} onKeyDown={handleEnter} onChange={(e) => setA5(formatTime(e.target.value))} isDisabled={disabledA5 || disabledCutoff} variant='bordered'/>
                                    </>
                                )}

                                <div className='text-sm text-default-500 mt-2'>
                                    <p>Time Limit: {numToFormatted(roundDetails?.timeLimit)} {isBlindfolded ? 'in total' : ''}</p>
                                    <p>Cutoff: {roundDetails?.cutoff ? numToFormatted(roundDetails.cutoff) : 'None'}</p>
                                </div>
                                <Button color='warning' variant='flat' className='mt-2 font-semibold' type='submit'>Submit</Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>

                <div className='w-full lg:w-2/3'>
                    <Table aria-label='Results Table' isStriped>
                        <TableHeader>
                            <TableColumn>#</TableColumn>
                            <TableColumn>Name</TableColumn>
                            {/* <TableColumn>Region</TableColumn> */}
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
                                const isValued = result.best !== null;
                                let rank = i + 1;
                                let isPassing = false;

                                if (isValued) {
                                    if (i > 0) {
                                        const prev = allResults[i - 1];
                                        // Rank checks
                                        if (prev.result && prev.result === result.result && prev.best === result.best) {
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
                                        <TableCell className={`font-bold ${cellTextColor}`}>{result.best ? numToFormatted(result.best) : ''}</TableCell>
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