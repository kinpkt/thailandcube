// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardBody, CardFooter, Select, SelectItem, Spinner, Button, Accordion, AccordionItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Checkbox, Link, Tooltip } from '@heroui/react';
// import { Competition, EventType, Format, Round } from '@/generated/prisma';
// import { getAllCompetitions } from '@/app/actions/competitions';
// import { getRoundsFromId, openRound, updateRound } from '@/app/actions/rounds';
// import { CubeIcon, ClockIcon, ScissorsIcon, NumberedListIcon, HashtagIcon } from '@heroicons/react/16/solid';
// import { EventCodeToFullMap, FormatCodeToFullMap } from '@/lib/EnumMapping';
// import { formattedToNum, numToFormatted } from '@/lib/DateTimeFormatter';

// type RoundFormData = Omit<Partial<Round>, 'timeLimit' | 'cutoff'> & 
// {
//     timeLimit?: string;
//     cutoff?: string;
// };

// const INITIAL_ROUND_STATE: RoundFormData = {
//     proceed: 0
// };

// type ExtendedRound = Round & {
//     eventEnum: EventType;
//     competitionId?: string;
// };

// const Dashboard = () =>
// {
//     const [competitions, setCompetitions] = useState<Competition[]>([]);
//     const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>();

//     useEffect(() =>
//     {
//         const loadCompetitions = async () =>
//         {
//             const queriedData = await getAllCompetitions();
//             setCompetitions(queriedData ?? []);
//             console.log(queriedData)
//         }

//         loadCompetitions();
//     }, []);

//     const handleSelectedCompetitionIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => 
//     {
//         setSelectedCompetitionId(e.target.value);
//     }

//     return (
//         <>
//             <Card className='mx-auto w-lg'>
//                 <CardHeader>
//                     <h1>Manage Competitions</h1>
//                 </CardHeader>
//                 <CardBody>
//                     <Select className='mb-5' selectedKeys={selectedCompetitionId ? [selectedCompetitionId] : []} onChange={handleSelectedCompetitionIdChange} label='Select a competition to manage'>
//                         {
//                             competitions.map((comp) => (
//                                 <SelectItem key={comp.competitionId}>{comp.name}</SelectItem>
//                             ))
//                         }
//                     </Select>
//                     {
//                         selectedCompetitionId ?
//                         <RoundDetails id={selectedCompetitionId}/> : <></>
//                     }
//                 </CardBody>
//             </Card>
//         </>
//     );
// }

// const RoundDetails = ({ id }: { id: string }) =>
// {
//     const [loading, setLoading] = useState(true);
//     const [rounds, setRounds] = useState<ExtendedRound[]>([]);
//     const [formData, setFormData] = useState<RoundFormData>(INITIAL_ROUND_STATE);
//     const [isFinalRound, setIsFinalRound] = useState(false);
//     const {isOpen, onOpen, onOpenChange} = useDisclosure();

//     const loadRoundData = async () =>
//     {
//         const queriedData = await getRoundsFromId(id);

//         const allRounds = queriedData?.flatMap(competition =>
//             competition.events.flatMap(event => 
//                 event.rounds.flatMap(round => ({
//                     ...round,
//                     eventEnum: event.event
//                 }))
//             )
//         );

//         setRounds(allRounds ?? []);
//         setLoading(false);
//     }

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const handleInputChange = (field: keyof Round, value: any) =>
//     {
//         setFormData(prev => ({...prev, [field]: value}));
//     }

//     const handleAddClick = () => 
//     {
//         setFormData({
//             ...INITIAL_ROUND_STATE,
//             round: rounds.length+1
//         });
//         onOpen();
//     };

//     const handleEditClick = (roundToEdit: Round) => 
//     {
//         setFormData({ 
//             ...roundToEdit,
//             timeLimit: numToFormatted(roundToEdit.timeLimit),
//             cutoff: numToFormatted(roundToEdit.cutoff),
//         });
//         onOpen();
//     };

//     const handleSave = async () => 
//     {
//         try 
//         {
//             const payload = {
//                 ...formData,
//                 competitionId: id, 
//                 timeLimit: formattedToNum(formData.timeLimit as string),
//                 cutoff: formattedToNum(formData.cutoff as string),
//                 proceed: formData.proceed ? Number(formData.proceed) : null, 
//             };

//             console.log('Sending payload:', payload);

//             const result = await updateCompetitionRound(id, payload as Round);

//             if (!result)
//                 throw new Error('Server action returned null');

//             alert('Task successfully done');
//             onOpenChange();
            
//             // Optional: Trigger a refresh of the list here
//             loadRoundData(); 
//         } 
//         catch (error) 
//         {
//             console.error('Failed to save:', error);
//             alert('Failed to save round. Check console for details.');
//         }
//     };

//     const handleOpenRound = async (event: EventType, round: number) =>
//     {
//         try 
//         {
//             const result = await openCompetitionRound(id, event, round)

//             if (!result)
//                 throw new Error('Server action returned null');

//             loadRoundData(); 
//         } 
//         catch (error) 
//         {
//             console.error('Failed to open:', error);
//             alert('Failed to open round. Check console for details.');
//         }
//     }

//     useEffect(() =>
//     {
//         loadRoundData();
//     }, [id]);

//     return (
//         <>
//             {
//                 loading ? 
//                 <div className='mx-auto flex justify-center mt-10'>
//                     <Spinner size='lg'/>
//                 </div> 
//                 :
//                 <div>
//                     <Button className='mb-5' color='primary' onPress={handleAddClick}>Add New Round</Button>
//                     {
//                         rounds.length === 0 ? 
//                         <p>No rounds found, please add a new round.</p> :
//                         <Accordion selectionMode='multiple' variant='bordered'>
//                             {
//                                 rounds.map((r) => (
//                                     <AccordionItem key={r.id} title={`${EventCodeToFullMap[r.eventEnum as EventType]} Round ${r.round}`}>
//                                         <p>Format: {FormatCodeToFullMap[r.format]}</p>
//                                         <p>Time Limit: {numToFormatted(r.timeLimit)}</p>
//                                         <p>Cutoff: {r.cutoff === 0 ? '-' : r.cutoff}</p>
//                                         <p>Proceeding: {r.proceed ?? '-'}</p>
//                                         {!r.open ? <Button color='success' variant='flat' onPress={() => handleOpenRound(r.eventEnum as EventType, r.round)}>Open Round</Button> : <Tooltip content='Already opened this round'><div className='inline-block'><Button color='success' variant='flat' isDisabled>Open Round</Button></div></Tooltip>}
//                                         {r.open ? <Button color='primary' variant='flat' className='mx-3' as={Link} href={`/admin/scoretake/${r.competitionId}/${r.eventId}/r${r.round}`}>Scoretake</Button> : <></>}
//                                         {/* {r.proceed ? <Button variant='flat'>Open Next Round</Button> : <></>} */}
//                                     </AccordionItem>
//                                 ))
//                             }
//                         </Accordion>
//                     }
//                     <Modal isOpen={isOpen} placement='top-center' onOpenChange={onOpenChange}>
//                         <ModalContent>
//                         {(onClose) => (
//                             <>
//                                 <ModalHeader className='flex flex-col gap-1'>Add New Round</ModalHeader>
//                                 <ModalBody>
//                                     <Input
//                                         endContent={
//                                             <HashtagIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
//                                         }
//                                         label='Round'
//                                         variant='bordered'
//                                         value={formData.round?.toString()}
//                                         isDisabled
//                                     />
//                                     <Select variant='bordered' label='Event' selectedKeys={formData.eventId ? [formData.eventId] : []} onChange={(e) => handleInputChange('eventId', e.target.value)}>
//                                         {
//                                             Object.values(EventType).map((event) => (
//                                                 <SelectItem key={event}>{EventCodeToFullMap[event as EventType]}</SelectItem>
//                                             ))
//                                         }
//                                     </Select>
//                                      <Select variant='bordered' label='Ranking Format' selectedKeys={formData.format ? [formData.format] : []} onChange={(e) => handleInputChange('format', e.target.value)}>
//                                         {
//                                             Object.values(Format).map((format) => (
//                                                 <SelectItem key={format}>{FormatCodeToFullMap[format as Format]}</SelectItem>
//                                             ))
//                                         }
//                                     </Select>
//                                     <Input
//                                         endContent={
//                                             <ClockIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
//                                         }
//                                         label='Time Limit'
//                                         placeholder='Ex. 10:00.00'
//                                         variant='bordered'
//                                         value={formData.timeLimit?.toString() || ''}
//                                         onValueChange={(val) => handleInputChange('timeLimit', val)}
//                                     />
//                                     <Input
//                                         endContent={
//                                             <ScissorsIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
//                                         }
//                                         label='Cutoff'
//                                         placeholder='Ex. 2:00.00'
//                                         variant='bordered'
//                                         value={formData.cutoff?.toString() || ''}
//                                         onValueChange={(val) => handleInputChange('cutoff', val)}
//                                     />
//                                     <Checkbox isSelected={isFinalRound} onValueChange={setIsFinalRound}>Marked as Final Round?</Checkbox>
//                                     <Input
//                                         endContent={
//                                             <NumberedListIcon className='w-5 h-5 text-default-400 pointer-events-none shrink-0' />
//                                         }
//                                         label='Proceeding (use decimal points for percentage)'
//                                         placeholder='Ex. 8 (For top 8), 0.75 (For top 75%)'
//                                         variant='bordered'
//                                         value={formData.proceed?.toString() || ''}
//                                         onValueChange={(val) => handleInputChange('proceed', val)}
//                                         isDisabled={isFinalRound}
//                                     />
//                                     <div className='flex py-2 px-1 justify-between'/>
//                                 </ModalBody>
//                                 <ModalFooter>
//                                     <Button color='danger' variant='flat' onPress={onClose}>
//                                         Close
//                                     </Button>
//                                     <Button color='success' variant='flat' onPress={handleSave}>
//                                         {formData && formData.id ? 'Save Changes' : 'Create'}
//                                     </Button>
//                                 </ModalFooter>
//                             </>
//                         )}
//                         </ModalContent>
//                     </Modal>
//                 </div>
//             }
//         </>
//     );
// }

// export default Dashboard;