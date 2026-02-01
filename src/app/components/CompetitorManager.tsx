'use client';

import { Card, CardHeader, CardBody, CardFooter, Select, SelectItem, Accordion, AccordionItem, Button, Modal, ModalContent, useDisclosure, ModalHeader, ModalBody, ModalFooter, Code } from '@heroui/react';
import { Competition, Competitor, Event, EventType, Registration, Result } from '@prisma/client';
import { useRef, useState, useEffect } from 'react';
import { getAllCompetitions } from '@/app/actions/competitions';
import { getAllCompetitorsByCompetitionId } from '@/app/actions/competitors';
import { ArrowUpTrayIcon, DocumentArrowUpIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { getAllEventsByCompetitionId } from '@/app/actions/events';
import { batchRegisterNewCompetitorFromCSV } from '@/app/actions/registrations';

interface ModalProps 
{
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

interface ExtendedModalProps extends ModalProps
{
    competitionId: string;
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

interface ExtendedCompetitor extends Competitor
{
    registrations: Registration[];
    results: Result[];
}

const CompetitorList = ({competitionId}: {competitionId: string}) =>
{
    const [competitors, setCompetitors] = useState<ExtendedCompetitor[]>();
    const {isOpen: isUploadOpen, onOpen: onUploadOpen, onOpenChange: onUploadOpenChange} = useDisclosure();

    useEffect(() =>
    {
        const loadCompetitions = async () =>
        {
            const queriedData = await getAllCompetitorsByCompetitionId(competitionId);
            setCompetitors(queriedData ?? []);
        }

        loadCompetitions();
    }, [competitionId]);

    return (
        <>
            <Button color='secondary' variant='flat' className='w-fit mb-5' onPress={onUploadOpen}>Upload File</Button>
            {
                competitors?.length === 0 ? <p>No competitors in this competition, please import one first.</p> :
                (
                    <Accordion variant='splitted'>
                        <AccordionItem title='Competitors List'>
                            {
                                competitors?.map((competitor: Competitor, index) =>
                                (
                                    <div className='grid grid-cols-[1fr_auto_auto] gap-4 mb-3 items-center' key={index}>
                                        <p>{competitor.name}</p>
                                        <Button color='warning' variant='flat' className='w-fit'><PencilIcon className='w-5 h-5'/></Button>
                                        <Button color='danger' variant='flat' className='w-fit'><TrashIcon className='w-5 h-5'/></Button>
                                    </div>
                                ))
                            }
                        </AccordionItem>
                    </Accordion>
                )
            }
            <FileUploadModal competitionId={competitionId} isOpen={isUploadOpen} onOpenChange={onUploadOpenChange}/>
        </>
    );
}

const FileUploadModal = ({competitionId, isOpen, onOpenChange}: ExtendedModalProps) =>
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
                alert(`Success! Added ${result.count} competitors.`);

                setSelectedFile(null);
                onOpenChange(false);
            } 
            else 
                alert('Server reported an error processing the file.');
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

export default CompetitorManager;