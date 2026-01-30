'use client';

import { Form, Input, Button, Select, SelectItem, DatePicker, Textarea } from '@heroui/react';
import { useState } from 'react';
import { parseAbsoluteToLocal, DateValue, getLocalTimeZone } from '@internationalized/date'; // Optional: depending on how you handle dates
import { EventCodeToFullMap } from '@/lib/EnumMapping';
import { EventType } from '@/generated/prisma';
import { createNewCompetition } from '@/app/actions/competitions';

const CreateCompetitionForm = () => {
    // State Management
    const [selectedEvents, setSelectedEvents] = useState(new Set<string>());
    const [startDate, setStartDate] = useState<DateValue|null>(null);
    const [endDate, setEndDate] = useState<DateValue|null>(null);
    
    // Using a single object for text fields to keep code clean
    const [formData, setFormData] = useState({
        competitionId: '',
        name: '',
        shortName: '',
        nameReason: '',
        venue: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare payload matches Prisma Schema
        const payload = {
            ...formData,
            startDate: startDate ? startDate.toDate(getLocalTimeZone()) : new Date(),
            endDate: endDate ? endDate.toDate(getLocalTimeZone()) : new Date(),
            shortName: formData.shortName || null,
            nameReason: formData.nameReason || null,
            proposalId: null
        };

        await createNewCompetition(payload);
        console.log('Submitting Competition:', payload);
    };

    return (
        <Form className='w-full max-w-lg mx-auto' onSubmit={handleSubmit}>
            <div className='grid grid-cols-2 gap-4'>
                
                {/* Competition ID & Name */}
                <Input 
                    label='Competition ID' 
                    placeholder='e.g. ThailandChampionship2026' 
                    isRequired 
                    value={formData.competitionId}
                    onValueChange={(val) => handleInputChange('competitionId', val)}
                />
                <Input 
                    label='Competition Name' 
                    placeholder='e.g., Thailand Championship 2026' 
                    isRequired 
                    value={formData.name}
                    onValueChange={(val) => handleInputChange('name', val)}
                />

                {/* Short Name & Venue */}
                <Input 
                    label='Short Name' 
                    placeholder='e.g., Zeer Rangsit 2025' 
                    value={formData.shortName}
                    onValueChange={(val) => handleInputChange('shortName', val)}
                />
                <Input 
                    label='Venue' 
                    placeholder='Location name' 
                    isRequired 
                    value={formData.venue}
                    onValueChange={(val) => handleInputChange('venue', val)}
                />

                {/* Name Reason (Optional) */}
                <Textarea 
                    className='col-span-full' 
                    label='Name Reason' 
                    placeholder='Reason for the name (if required)'
                    value={formData.nameReason}
                    onValueChange={(val) => handleInputChange('nameReason', val)}
                />

                {/* Dates */}
                <DatePicker 
                    label='Start Date' 
                    isRequired 
                    value={startDate} 
                    onChange={setStartDate}
                />
                <DatePicker 
                    label='End Date' 
                    isRequired 
                    value={endDate} 
                    onChange={setEndDate}
                />

                {/* Events Multi-Select */}
                {/* <Select 
                    className='col-span-full' 
                    label='Events' 
                    placeholder='Select events' 
                    selectionMode='multiple'
                    selectedKeys={selectedEvents}
                    onSelectionChange={(keys) => setSelectedEvents(new Set(keys as Set<string>))}
                    isRequired
                >
                    {Object.values(EventType).map((eventCode) => (
                        <SelectItem key={eventCode} textValue={EventCodeToFullMap[eventCode as EventType] || eventCode}>
                            {EventCodeToFullMap[eventCode as EventType] || eventCode}
                        </SelectItem>
                    ))}
                </Select> */}

            </div>

            <Button className='mx-auto mt-6 w-full' color='primary' type='submit'>
                Create Competition
            </Button>
        </Form>
    );
}

export default CreateCompetitionForm;