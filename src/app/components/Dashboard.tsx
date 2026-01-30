'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Select, SelectItem, Spinner, Button, Accordion, AccordionItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Checkbox, Link, Tooltip } from '@heroui/react';
import { Competition, Event, EventType, Format, RegistrationEvent, Round } from '@prisma/client';
import { getAllCompetitions } from '@/app/actions/competitions';
import { getAllRoundsByEventId, openRound, updateRound } from '@/app/actions/rounds';
import { LinkIcon, ClockIcon, ScissorsIcon, NumberedListIcon, HashtagIcon } from '@heroicons/react/16/solid';
import { EventCodeToFullMap, FormatCodeToFullMap } from '@/lib/EnumMapping';
import { formattedToNum, numToFormatted } from '@/lib/DateTimeFormatter';
import { createEvent, getAllEventsByCompetitionId } from '@/app/actions/events';

interface ExtendedEvent extends Event
{
    registrationEvents: RegistrationEvent[];
    rounds: Round[]
}

const Dashboard = () =>
{
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>();

    useEffect(() =>
    {
        const loadCompetitions = async () =>
        {
            const queriedData = await getAllCompetitions();
            setCompetitions(queriedData ?? []);
            console.log(queriedData)
        }

        loadCompetitions();
    }, []);

    const handleSelectedCompetitionIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => 
    {
        setSelectedCompetitionId(e.target.value);
    }

    return (
        <>
            <Card className='mx-auto w-lg'>
                <CardHeader>
                    <h1>Manage Competitions</h1>
                </CardHeader>
                <CardBody>
                    <Select className='mb-5' selectedKeys={selectedCompetitionId ? [selectedCompetitionId] : []} onChange={handleSelectedCompetitionIdChange} label='Select a competition to manage'>
                        {
                            competitions.map((comp) => (
                                <SelectItem key={comp.competitionId}>{comp.name}</SelectItem>
                            ))
                        }
                    </Select>
                    {
                        selectedCompetitionId ?
                        <EventDetails competitionId={selectedCompetitionId}/> : <></>
                    }
                </CardBody>
            </Card>
        </>
    );
}

const EventDetails = ({ competitionId }: { competitionId: string }) =>
{
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<ExtendedEvent[]>([]);
    const [formData, setFormData] = useState<Event>();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const loadEventData = async () =>
    {
        const events = await getAllEventsByCompetitionId(competitionId);

        // const allRounds = queriedData?.flatMap(competition =>
        //     competition.events.flatMap(event => 
        //         event.rounds.flatMap(round => ({
        //             ...round,
        //             eventEnum: event.event
        //         }))
        //     )
        // );

        setEvents(events ?? []);
        setLoading(false);
    }

    const handleInputChange = (field: keyof Event, value: string) =>
    {
        setFormData(prev => 
        {
            if (!prev)
                return prev;
            return {...prev, [field]: value};
        });
    }

    const handleAddClick = () => 
    {
        setFormData({
            competitionId: competitionId,
            event: Object.values(EventType)[0],
            maxAge: null,
        } as Event);
        onOpen();
    };

    const handleEditClick = (roundToEdit: Round) => 
    {
        // setFormData({ 
        //     ...roundToEdit,
        //     timeLimit: numToFormatted(roundToEdit.timeLimit),
        //     cutoff: numToFormatted(roundToEdit.cutoff),
        // });
        onOpen();
    };

    const handleSave = async () => 
    {
        if (!formData || !formData.event) 
        {
            alert('Please select an event type.');
            return;
        }

        try 
        {
            const payload = {
                ...formData,
                competitionId, 
                maxAge: Number(formData?.maxAge)
            };

            console.log('Sending payload:', payload);

            await createEvent({eventData: payload});

            alert('Task successfully done');
            onOpenChange();
            
            // Optional: Trigger a refresh of the list here
            loadEventData(); 
        } 
        catch (error) 
        {
            console.error('Failed to save:', error);
            alert('Failed to save round. Check console for details.');
        }
    };

    useEffect(() =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadEventData();
    }, [competitionId]);

    return (
        <>
            {
                loading ? 
                <div className='mx-auto flex justify-center mt-10'>
                    <Spinner size='lg'/>
                </div> 
                :
                <div>
                    <Button className='mb-5' color='primary' variant='flat' onPress={handleAddClick}>Add New Event</Button>
                    {
                        events.length === 0 ? 
                        <p>No events found, please add a new event.</p> :
                        <Accordion selectionMode='multiple' variant='bordered'>
                            {
                                events.map((e) => (
                                    <AccordionItem key={e.id} title={`${EventCodeToFullMap[e.event as EventType]} ${e.maxAge ? `(Max Age: ${e.maxAge})` : '(Open To All Age)'}`}>
                                        <RoundDetails eventId={e.id} competitionId={competitionId}/>
                                        {/* <p>Format: {FormatCodeToFullMap[r.format]}</p>
                                        <p>Time Limit: {numToFormatted(r.timeLimit)}</p>
                                        <p>Cutoff: {r.cutoff === 0 ? '-' : r.cutoff}</p>
                                        <p>Proceeding: {r.proceed ?? '-'}</p> */}
                                        {/* {!r.open ? <Button color='success' variant='flat' onPress={() => handleOpenRound(r.eventEnum as EventType, r.round)}>Open Round</Button> : <Tooltip content='Already opened this round'><div className='inline-block'><Button color='success' variant='flat' isDisabled>Open Round</Button></div></Tooltip>}
                                        {r.open ? <Button color='primary' variant='flat' className='mx-3' as={Link} href={`/admin/scoretake/${r.competitionId}/${r.eventId}/r${r.round}`}>Scoretake</Button> : <></>} */}
                                        {/* {r.proceed ? <Button variant='flat'>Open Next Round</Button> : <></>} */}
                                    </AccordionItem>
                                ))
                            }
                        </Accordion>
                    }
                    <Modal isOpen={isOpen} placement='top-center' onOpenChange={onOpenChange}>
                        <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className='flex flex-col gap-1'>Add New Event</ModalHeader>
                                <ModalBody>
                                    <Select variant='bordered' label='Event' selectedKeys={formData?.event ? [formData?.event] : []} onChange={(e) => handleInputChange('event', e.target.value)}>
                                        {
                                            Object.values(EventType).map((event) => (
                                                <SelectItem key={event}>{EventCodeToFullMap[event as EventType]}</SelectItem>
                                            ))
                                        }
                                    </Select>
                                    <Input
                                        label='Age Limit'
                                        placeholder='(Leave as blank if not specified)'
                                        variant='bordered'
                                        value={formData?.maxAge?.toString() || ''}
                                        onValueChange={(val) => handleInputChange('maxAge', val)}
                                    />
                                    <div className='flex py-2 px-1 justify-between'/>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color='danger' variant='flat' onPress={onClose}>
                                        Close
                                    </Button>
                                    <Button color='success' variant='flat' onPress={handleSave}>
                                        {formData && formData.id ? 'Save Changes' : 'Create'}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                        </ModalContent>
                    </Modal>
                </div>
            }
        </>
    );
}

interface ExtendedRound extends Round
{
    event: Event;
}

const RoundDetails = ({ eventId, competitionId }: { eventId: number, competitionId: string }) =>
{
    const [loading, setLoading] = useState(true);
    const [rounds, setRounds] = useState<ExtendedRound[]>([]);
    const [formData, setFormData] = useState<Round>();
    const [isFinalRound, setIsFinalRound] = useState(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const loadRoundData = async () =>
    {
        const roundsData = await getAllRoundsByEventId({eventId}, {withResults: false});

        // const allRounds = queriedData?.flatMap(competition =>
        //     competition.events.flatMap(event => 
        //         event.rounds.flatMap(round => ({
        //             ...round,
        //             eventEnum: event.event
        //         }))
        //     )
        // );

        setRounds(roundsData ?? []);
        setLoading(false);
    }

    const handleAddClick = () => 
    {
        setFormData({
            eventId,
            round: rounds.length + 1,
        } as Round);
        onOpen();
    };

    const handleInputChange = (field: keyof Round, value: string) =>
    {
        setFormData(prev => 
        {
            if (!prev)
                return prev;
            return {...prev, [field]: value};
        });
    }

    const handleOpenRound = async (round: number) =>
    {
        try 
        {
            await openRound({eventId, roundNumber: round})

            loadRoundData(); 
        } 
        catch (error) 
        {
            console.error('Failed to open:', error);
            alert('Failed to open round. Check console for details.');
        }
    }

    const handleSave = async () => 
    {
        try 
        {
            const payload = {
                ...formData,
                timeLimit: formattedToNum(formData?.timeLimit?.toString()),
                cutoff: formattedToNum(formData?.cutoff?.toString()),
                proceed: formData?.proceed ? Number(formData?.proceed) : null, 
            };

            console.log('Sending payload:', payload);

            const result = await updateRound({eventId, roundNumber: payload.round, roundData: payload as Round});

            if (!result)
                throw new Error('Server action returned null');

            onOpenChange();
            
            // Optional: Trigger a refresh of the list here
            loadRoundData(); 
        } 
        catch (error) 
        {
            console.error('Failed to save:', error);
            alert('Failed to save round. Check console for details.');
        }
    }

    useEffect(() =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRoundData();
    }, [eventId]);

    return (
        <>
            <Button className='mb-5' color='primary' onPress={handleAddClick}>Add New Round</Button>
            {
                rounds.length === 0 ? 
                <p>No rounds found, please add a new round.</p> :
                <>
                    {
                        rounds.map((r: ExtendedRound) => (
                            <div className='grid grid-cols-3 gap-4 mb-3 items-center' key={r.id}>
                                <p>Round {r.round}</p>
                                {
                                    !r.open && r.format !== Format.H2H ? 
                                    <Button color='success' variant='flat' onPress={() => handleOpenRound(r.round)}>Open Round</Button> 
                                    : r.format === Format.H2H ? 
                                    <Button color='success' variant='flat' as={Link} href={r.tournamentUrl ?? ''}>Manage Bracket</Button> 
                                    :
                                    <Tooltip content='Already opened this round'><div className='inline-block'><Button color='success' variant='flat' isDisabled>Open Round</Button></div></Tooltip>}
                                {r.open ? <Button color='primary' variant='flat' as={Link} href={`/admin/scoretake/${competitionId}/${r.eventId}/r${r.round}`}>Scoretake</Button> : <></>}
                                {/* {r.proceed ? <Button variant='flat'>Open Next Round</Button> : <></>} */}
                            </div>
                        ))
                    }
                </>
            }

            <Modal isOpen={isOpen} placement='top-center' onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>Add New Round</ModalHeader>
                            <ModalBody>
                                <Input
                                    endContent={
                                        <HashtagIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
                                    }
                                    label='Round'
                                    variant='bordered'
                                    value={formData?.round?.toString()}
                                    isDisabled
                                />
                                <Select variant='bordered' label='Ranking Format' selectedKeys={formData?.format ? [formData?.format] : []} onChange={(e) => handleInputChange('format', e.target.value)}>
                                    {
                                        Object.values(Format).map((format) => (
                                            <SelectItem key={format}>{FormatCodeToFullMap[format as Format]}</SelectItem>
                                        ))
                                    }
                                </Select>
                                {formData?.format === Format.H2H ? 
                                    (<Input
                                        endContent={
                                            <LinkIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
                                        }
                                        label='Tournament Bracket URL'
                                        placeholder='Challonge or other platforms'
                                        variant='bordered'
                                        value={formData?.tournamentUrl || ''}
                                        onValueChange={(val) => handleInputChange('tournamentUrl', val)}
                                    />) : <></>
                                }
                                <Input
                                    endContent={
                                        <ClockIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
                                    }
                                    label='Time Limit'
                                    placeholder='Ex. 10:00.00'
                                    variant='bordered'
                                    value={formData?.timeLimit?.toString() || ''}
                                    onValueChange={(val) => handleInputChange('timeLimit', val)}
                                />
                                <Input
                                    endContent={
                                        <ScissorsIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
                                    }
                                    label='Cutoff'
                                    placeholder='Ex. 2:00.00'
                                    variant='bordered'
                                    value={formData?.cutoff?.toString() || ''}
                                    onValueChange={(val) => handleInputChange('cutoff', val)}
                                />
                                <Checkbox isSelected={isFinalRound} onValueChange={setIsFinalRound}>Marked as Final Round?</Checkbox>
                                <Input
                                    endContent={
                                        <NumberedListIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
                                    }
                                    label='Proceeding (use decimal points for percentage)'
                                    placeholder='Ex. 8 (For top 8), 0.75 (For top 75%)'
                                    variant='bordered'
                                    value={formData?.proceed?.toString() || ''}
                                    onValueChange={(val) => handleInputChange('proceed', val)}
                                    isDisabled={isFinalRound}
                                />
                                <div className='flex py-2 px-1 justify-between'/>
                            </ModalBody>
                            <ModalFooter>
                                <Button color='danger' variant='flat' onPress={onClose}>
                                    Close
                                </Button>
                                <Button color='success' variant='flat' onPress={handleSave}>
                                    {formData && formData.id ? 'Save Changes' : 'Create'}
                                </Button>
                            </ModalFooter>
                        </>
                )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default Dashboard;