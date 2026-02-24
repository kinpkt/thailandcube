/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardHeader, CardBody, CardFooter, Select, SelectItem, Button, addToast, Input, Textarea } from '@heroui/react';
import { EventType, NationalRecord, RecordType } from '@prisma/client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { getAllNRs, submitNR } from '../actions/national-records';
import { EventCodeToFullMap } from '@/lib/EnumMapping';
import { ArrowUpTrayIcon, CheckIcon, DocumentArrowUpIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/16/solid';
import Image from 'next/image';

const AdminNRManager = () =>
{
    const [loading, setLoading] = useState(true);
    const [allNRs, setAllNRs] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventType>();
    const [selectedRecordType, setSelectedRecordType] = useState<RecordType>();

    useEffect(() =>
    {
        const getNRData = async () => 
        {
            const data = await getAllNRs();
            setAllNRs(data ?? []);
            setLoading(false);
        }

        if (loading)
            getNRData();
    }, [loading]);

    const shownNR = useMemo(() =>
    {
        if (!selectedEvent || !selectedRecordType)
            return undefined;
        
        return allNRs.find(record => record.event === selectedEvent && record.type === selectedRecordType);
    }, [allNRs, selectedEvent, selectedRecordType]);

    const handleSelectedEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => 
    {
        setSelectedEvent(e.target.value as EventType);
        setSelectedRecordType(undefined);
    }

    const handleSelectedRecordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => 
    {
        setSelectedRecordType(e.target.value as RecordType);
    }

    return (
        <>
            <Card className='w-full max-w-lg mt-10'>
                <CardHeader>
                    <h1>Manage NR</h1>
                </CardHeader>
                <CardBody>
                    <Select className='mb-5' selectedKeys={selectedEvent ? [selectedEvent] : []} onChange={handleSelectedEventChange} label='Select a WCA event'>
                        {
                            Object.values(EventType).map((e) => (
                                <SelectItem key={e}>{EventCodeToFullMap[e]}</SelectItem>
                            ))
                        }
                    </Select>
                    {
                        selectedEvent && selectedEvent !== EventType.E333MBF ? (
                            <Select className='mb-5' selectedKeys={selectedRecordType ? [selectedRecordType] : []} onChange={handleSelectedRecordTypeChange} label='Select a record type'>
                                {
                                    Object.values(RecordType).map((r) => (
                                        <SelectItem key={r}>{r}</SelectItem>
                                    ))
                                }
                            </Select>
                        ) : <></>
                    }
                    {
                        shownNR && <NRCard record={shownNR}/>
                    }
                </CardBody>
            </Card>
        </>
    );
}

const NRCard = ({record}: {record: NationalRecord}) =>
{
    const [formData, setFormData] = useState({...record, caption: ''});
    const [selectedFile, setSelectedFile] = useState<File|null>(null);
    const [previewUrl, setPreviewUrl] = useState<string|null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => 
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({ ...record, caption: record.caption ?? '' });
    }, [record]);

    useEffect(() => 
    {
        if (!selectedFile) 
        {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleUploadClick = () =>
    {
        fileInputRef.current?.click();
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/'))
            setSelectedFile(file);
        else
            alert('Please select a valid image file.');
    }

    const handleRemoveFile = () => 
    {
        setSelectedFile(null);
        
        if (fileInputRef.current)
            fileInputRef.current.value = '';
    }

    const handleInputChange = (field: string, value: string) => 
    {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const handleSubmit = async () =>
    {
        if (!selectedFile) 
            return;

        try
        {
            const payload = new FormData();

            payload.append('id', formData.id.toString());
            payload.append('holder', formData.holder);
            payload.append('competition', formData.competition);
            payload.append('result', formData.result);
            payload.append('event', formData.event);
            payload.append('type', formData.type);
            payload.append('caption', formData.caption || '');
            payload.append('file', selectedFile);
            
            const submission = await submitNR(payload);

            if (submission && submission.success) 
            {
                addToast({title: 'แก้ไขข้อมูลสถิติประเทศสำเร็จ', color: 'success', icon: (<CheckIcon/>)})
                // onOpenChange(false);

                // if (onDataChange)
                //     onDataChange();
            } 
            else 
                addToast({title: 'เกิดข้อผิดพลาดระหว่างการเปลี่ยนข้อมูลสถิติประเทศ', color: 'danger', icon: (<ExclamationCircleIcon/>)})
        }
        catch (err)
        {
            console.error('Error in handleSave:', err);
            alert('Something went wrong during the upload.');
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <p className='text-2xl font-bold'>{`${EventCodeToFullMap[record.event]} NR ${record.type[0]}${record.type.toLocaleLowerCase().slice(1, record.type.length)}`}</p>
                </CardHeader>
                <CardBody className='gap-5'>
                    <Input label='Record Holder' value={formData.holder} onChange={(e) => handleInputChange('holder', e.target.value)} type='text' isRequired/>
                    <Input label='Competition' value={formData.competition} onChange={(e) => handleInputChange('competition', e.target.value)} type='text' isRequired/>
                    <Input label='Result' placeholder='ผลการแก้โจทย์ที่ได้ เช่น 4.02, 4:22.38, 27/28 48:35' value={formData.result} onChange={(e) => handleInputChange('result', e.target.value)} type='text' isRequired/>
                    <input
                        type='file' 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept='.jpg,.jpeg,.png'
                        className='hidden' 
                    />
                    {!selectedFile ? (
                        <Button 
                            variant='bordered'
                            className='h-24 border-dashed border-2 flex flex-col gap-2'
                            onPress={handleUploadClick}
                            endContent={<ArrowUpTrayIcon className='w-5 h-5'/>}
                        >
                            Click to upload NR image
                        </Button>
                        ) : (
                        <div className='flex flex-col gap-3'>
                            {previewUrl && (
                                <div className='relative w-full h-48 rounded-lg overflow-hidden border border-default-200'>
                                    <Image 
                                        src={previewUrl} 
                                        alt='Preview' 
                                        fill
                                        unoptimized
                                        className='w-full h-full object-contain bg-black/5' // object-contain preserves aspect ratio
                                    />
                                </div>
                            )}

                            <div className='flex items-center justify-between p-3 border rounded-lg bg-default-50'>
                                <div className='flex items-center gap-3'>
                                    <DocumentArrowUpIcon className='w-8 h-8 text-primary' />
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
                                    color='danger'
                                    onPress={handleRemoveFile}
                                >
                                    <XMarkIcon className='w-4 h-4' />
                                </Button>
                            </div>
                        </div>
                    )}
                    <Textarea value={formData.caption} onChange={(e) => handleInputChange('caption', e.target.value)} label='Caption' type='text' placeholder='ข้อความประกอบ NR'/>
                </CardBody>
                <CardFooter>
                    <Button color='success' variant='flat' onPress={handleSubmit}>Submit</Button>
                </CardFooter>
            </Card>
        </>
    );
}

export default AdminNRManager;