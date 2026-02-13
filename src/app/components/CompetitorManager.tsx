'use client';

import { Card, CardHeader, CardBody, CardFooter, Select, SelectItem, Accordion, AccordionItem, Button, Modal, ModalContent, useDisclosure, ModalHeader, ModalBody, ModalFooter, Code, Form, Input, addToast } from '@heroui/react';
import { Competition, Competitor, Event, EventType, Registration, RegistrationEvent, Result } from '@prisma/client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { getAllCompetitions } from '@/app/actions/competitions';
import { getAllCompetitorsByCompetitionId } from '@/app/actions/competitors';
import { ArrowUpTrayIcon, CheckIcon, DocumentArrowUpIcon, ExclamationCircleIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { getAllEventsByCompetitionId, getEventByCompetitionId } from '@/app/actions/events';
import { batchRegisterNewCompetitorFromCSV, deleteCompetitor, registerNewCompetitor } from '@/app/actions/registrations';
import { EventCodeToFullMap } from '@/lib/EnumMapping';

interface ModalProps 
{
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

interface ExtendedModalProps extends ModalProps
{
    maxRegistrationId?: number;
    competitor?: ExtendedCompetitor | null;
    competitionId: string;
    eventsInComp?: Event[];
    onDataChange?: () => void;
}

interface ExtendedRegistration extends Registration
{
    events: RegistrationEvent[];
}

export interface ExtendedCompetitor extends Competitor
{
    registrations: ExtendedRegistration[];
    results: Result[];
}

const CompetitorManager = () =>
{
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>();

    useEffect(() =>
    {
        const loadCompetitions = async () =>
        {
            const queriedData = await getAllCompetitions();
            setCompetitions(queriedData ?? []);
        }

        loadCompetitions();
    }, []);

    const handleSelectedCompetitionIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => 
    {
        setSelectedCompetitionId(e.target.value);
    }

    return (
        <>
            <Card className='mx-auto w-lg mb-10'>
                <CardHeader>
                    <h1>Manage Competitors</h1>
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
                        selectedCompetitionId ? <CompetitorList competitionId={selectedCompetitionId}/> : <p></p>
                    }
                </CardBody>
            </Card>
        </>
    );
}

const CompetitorList = ({competitionId}: {competitionId: string}) =>
{
    const [competitors, setCompetitors] = useState<ExtendedCompetitor[]>();
    const [selectedCompetitor, setSelectedCompetitor] = useState<ExtendedCompetitor|null>(null);
    const [eventsInComp, setEventsInComp] = useState<Event[]>();
    const {isOpen: isUploadOpen, onOpen: onUploadOpen, onOpenChange: onUploadOpenChange} = useDisclosure();
    const {isOpen: isManualAddOpen, onOpen: onManualAddOpen, onOpenChange: onManualAddOpenChange} = useDisclosure();
    const {isOpen: isConfirmDeleteOpen, onOpen: onConfirmDeleteOpen, onOpenChange: onConfirmDeleteOpenChange} = useDisclosure();

    const loadData = useCallback(async () =>
    {
        const queriedCompetitorsData = await getAllCompetitorsByCompetitionId(competitionId);
        const queriedEventsInCompData = await getAllEventsByCompetitionId(competitionId);
        setCompetitors(queriedCompetitorsData as unknown as ExtendedCompetitor[] ?? []);
        setEventsInComp(queriedEventsInCompData ?? []);
    }, [competitionId]);

    useEffect(() =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    const handleAddClick = () =>
    {
        setSelectedCompetitor(null);
        onManualAddOpen();
    }

    const handleEditClick = (competitor: ExtendedCompetitor) =>
    {
        setSelectedCompetitor(competitor);
        onManualAddOpen();
    }

    const handleDeleteClick = (competitor: ExtendedCompetitor) =>
    {
        setSelectedCompetitor(competitor);
        onConfirmDeleteOpen();
    }

    return (
        <>
            <Button color='secondary' variant='flat' className='w-fit mb-5' onPress={onUploadOpen}>Upload File</Button>
            <Button color='primary' variant='flat' className='w-fit mb-5' onPress={handleAddClick}>Add Competitor (Manual)</Button>
            {
                competitors?.length === 0 ? <p>No competitors in this competition, please import one first.</p> :
                (
                    <Accordion variant='splitted'>
                        <AccordionItem title='Competitors List'>
                            {
                                competitors?.map((competitor: ExtendedCompetitor, index) =>
                                (
                                    <div className='grid grid-cols-[1fr_auto_auto] gap-4 mb-3 items-center' key={index}>
                                        <p>{competitor.name}</p>
                                        <Button color='warning' variant='flat' className='w-fit' onPress={() => handleEditClick(competitor)} isIconOnly><PencilSquareIcon className='w-5 h-5'/></Button>
                                        <Button color='danger' variant='flat' className='w-fit' onPress={() => handleDeleteClick(competitor)} isIconOnly><TrashIcon className='w-5 h-5'/></Button>
                                    </div>
                                ))
                            }
                        </AccordionItem>
                    </Accordion>
                )
            }
            <FileUploadModal competitionId={competitionId} isOpen={isUploadOpen} onOpenChange={onUploadOpenChange} onDataChange={loadData}/>
            <ManualAddCompetitorModal maxRegistrationId={competitors ? Math.max(...competitors.flatMap(c => c.registrations).filter(r => r.competitionId === competitionId).map(r => r.id)) : 0} competitor={selectedCompetitor} competitionId={competitionId} eventsInComp={eventsInComp} isOpen={isManualAddOpen} onOpenChange={onManualAddOpenChange} onDataChange={loadData}/>
            <ConfirmDeleteCompetitorModal competitor={selectedCompetitor} competitionId={competitionId} eventsInComp={eventsInComp} isOpen={isConfirmDeleteOpen} onOpenChange={onConfirmDeleteOpenChange} onDataChange={loadData}/>
        </>
    );
}

const FileUploadModal = ({competitionId, isOpen, onOpenChange, onDataChange}: ExtendedModalProps) =>
{    
    const [eventsInComp, setEventsInComp] = useState<Event[]>([]);
    const [selectedFile, setSelectedFile] = useState<File|null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () =>
    {
        fileInputRef.current?.click();
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/csv')
            setSelectedFile(file);
        else
            alert('Please select a valid CSV file.');
    };

    const handleSave = async () => 
    {
        if (!selectedFile) 
            return;

        try
        {
            const csvText = await selectedFile.text();

            const result = await batchRegisterNewCompetitorFromCSV({csvText, competitionId, eventsInComp})

            if (result.success) 
            {
                addToast({title: `เพิ่มผู้เข้าแข่งขันจำนวน ${result.count} คน สำเร็จ`, color: 'success', icon: (<CheckIcon/>)})

                setSelectedFile(null);
                onOpenChange(false);

                if (onDataChange)
                    onDataChange();
            } 
            else 
                addToast({title: 'เกิดข้อผิดพลาดระหว่างการเพิ่มผู้เข้าแข่งขัน', color: 'danger', icon: (<ExclamationCircleIcon/>)})
        }
        catch (err)
        {
            console.error('Error in handleSave:', err);
            alert('Something went wrong during the upload.');
        }
        
        setSelectedFile(null);
        onOpenChange(false);
    }

    useEffect(() =>
    {
        const loadAllEvents = async () =>
        {
            const events = await getAllEventsByCompetitionId(competitionId, {withRounds: false, withRegistrationEvents: false});

            setEventsInComp(events ?? []);
        }
        loadAllEvents();
    }, [competitionId]);

    const getExampleCSVHeader = (events: Event[]) =>
    {
        const fullEventType = events.map((e: Event) => 
            {
                let eventType = e.event.toString();

                if (eventType[0] === 'E')
                    eventType = eventType.slice(1);

                return e.maxAge ? `${eventType}_U${e.maxAge}` : eventType;
            }
        );

        return `id,name,wca_id,${fullEventType.join(',')}`;
    }

    return (
        <>
            <Modal isOpen={isOpen} placement='top-center' onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>Upload Competitors CSV</ModalHeader>
                            <ModalBody>
                                File Format (CSV Header):
                                <Code>
                                    {getExampleCSVHeader(eventsInComp)}
                                </Code>
                                <input 
                                    type='file' 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept='.csv'
                                    className='hidden' 
                                />
                                {!selectedFile ? (
                                    <Button 
                                        variant='bordered'
                                        className='h-24 border-dashed border-2 flex flex-col gap-2'
                                        onPress={handleUploadClick}
                                        endContent={<ArrowUpTrayIcon className='w-5 h-5'/>}
                                    >
                                        Click to upload CSV
                                    </Button>
                                ) : (
                                    <div className='flex items-center justify-between p-3 border rounded-lg bg-default-50'>
                                        <div className='flex items-center gap-3'>
                                            <DocumentArrowUpIcon className='w-8 h-8 text-primary'/>
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-medium truncate max-w-[200px]'>
                                                    {selectedFile.name}
                                                </span>
                                                <span className='text-xs text-default-400'>
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </span>
                                            </div>
                                        </div>
                                        <Button 
                                            isIconOnly 
                                            size='sm'
                                            variant='light' 
                                            onPress={() => setSelectedFile(null)}
                                        >
                                            <XMarkIcon className='w-4 h-4' />
                                        </Button>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color='danger' variant='flat' onPress={onClose}>
                                    Close
                                </Button>
                                <Button 
                                    color='success'
                                    variant='flat'
                                    isDisabled={!selectedFile}
                                    onPress={handleSave}
                                >
                                    Confirm Upload
                                </Button>
                            </ModalFooter>
                        </>
                )}
                </ModalContent>
            </Modal>
        </>
    );
}

const ManualAddCompetitorModal = ({maxRegistrationId=0, competitor, competitionId, eventsInComp=[], isOpen, onOpenChange, onDataChange}: ExtendedModalProps) =>
{
    const [name, setName] = useState('');
    const [wcaId, setWCAId] = useState('');
    const [selectedEventKeys, setSelectedEventKeys] = useState<Set<string>>(new Set([]));

    const displayId = competitor ? competitor.registrations[0].id : maxRegistrationId+1;

    useEffect(() => 
    {
        if (isOpen) 
        {
            if (competitor) 
            {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setName(competitor.name);
                setWCAId(competitor.wcaId ?? '');

                const currentRegistration = competitor.registrations.find(r => r.competitionId === competitionId);
                const existingEventIds = currentRegistration?.events.map((e) => e.eventId.toString()) || [];
                setSelectedEventKeys(new Set(existingEventIds));
            } 
            else 
            {
                setName('');
                setWCAId('');
                setSelectedEventKeys(new Set([]));
            }
        }
    }, [isOpen, competitor]);

    const handleSave = async () =>
    {
        const payload = {
            competitorId: competitor?.id.toString() ?? '',
            id: displayId.toString(),
            wca_id: wcaId,
            name: name,
            ...Array.from(selectedEventKeys).reduce((acc, eventId) =>
            {
                acc[eventId] = 'true';
                return acc;
            }, {} as Record<string, string>)
        };

        await registerNewCompetitor({payload, competitionId, eventsInComp});

        addToast({title: 'เพิ่มผู้เข้าแข่งขันสำเร็จ', color: 'success', icon: (<CheckIcon/>)})
        
        if (onDataChange)
            onDataChange();

        onOpenChange(false);
    }

    return (
        <>
            <Modal isOpen={isOpen} placement='top-center' onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>{competitor ? `Edit ${competitor.name}` : 'Add New Competitor'}</ModalHeader>
                            <ModalBody>
                                <Form>
                                    <Input value={displayId.toString()} type='number' label='ID' isDisabled/>
                                    <Input onValueChange={setName} value={name} name='competitor-name' label='ชื่อ - นามสกุล' placeholder='ชื่อ - นามสกุลของผู้เข้าแข่งขัน' isRequired/>
                                    <Input onValueChange={setWCAId} value={wcaId} name='wca-id' label='WCA ID' placeholder='WCA ID ผู้เข้าแข่งขัน'/>
                                    <Select variant='bordered' selectionMode='multiple' label='Events' selectedKeys={selectedEventKeys} onSelectionChange={(keys) => setSelectedEventKeys(keys as Set<string>)}>
                                        {
                                            eventsInComp.map((event) => (
                                                <SelectItem key={event.id}>{`${EventCodeToFullMap[event.event as EventType]} ${event.maxAge ? `(Max Age: ${event.maxAge})` : '(Open To All Age)'}`}</SelectItem>
                                            ))
                                        }
                                    </Select>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button color='danger' variant='flat' onPress={onClose}>
                                    Close
                                </Button>
                                <Button 
                                color='success' 
                                variant='flat' 
                                onPress={handleSave}
                            >
                                {competitor ? 'Save Changes' : 'Confirm Add'}
                            </Button>
                            </ModalFooter>
                        </>
                )}
                </ModalContent>
            </Modal>
        </>
    );
}

const ConfirmDeleteCompetitorModal = ({competitor, competitionId, eventsInComp=[], isOpen, onOpenChange, onDataChange}: ExtendedModalProps) =>
{
    const handleDelete = async () =>
    {
        await deleteCompetitor({competitor, competitionId, eventsInComp});

        addToast({title: 'ลบผู้เข้าแข่งขันสำเร็จ', color: 'success', icon: (<CheckIcon/>)})
        
        if (onDataChange)
            onDataChange();

        onOpenChange(false);
    }

    return (
        <>
            <Modal isOpen={isOpen} placement='top-center' onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>{`Delete ${competitor?.name} From This Competition?`}</ModalHeader>
                            <ModalBody>
                                Please be aware that you will have to add this competitor again after removed.
                            </ModalBody>
                            <ModalFooter>
                                <Button color='danger' variant='flat' onPress={onClose}>
                                    Close
                                </Button>
                                <Button 
                                    color='success' 
                                    variant='flat' 
                                    onPress={handleDelete}
                                >
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default CompetitorManager;