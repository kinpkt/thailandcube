'use client';

import { Form, Input, Button, ButtonGroup, Select, SelectItem, DatePicker, TimeInput, Switch } from '@heroui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

const SuperUserCreateCompForm = () =>
{
    const [selectedJobType, setSelectedJobType] = useState(new Set<string|number>());
    const [selectedDentistType, setSelectedDentistType] = useState(new Set<string|number>());
    const [selectedWorkingDays, setSelectedWorkingDays] = useState(new Set<string|number>());
    const [selectedWorkingWeeks, setSelectedWorkingWeeks] = useState(new Set<string|number>());
    const [selectedSpecialistType, setSelectedSpecialistType] = useState(new Set<string|number>());
    const [isAveragePay, setIsAveragePay] = useState<boolean>(false);
    const showPartTime = selectedJobType.has(JobType.PARTTIME);
    const showFullTime = selectedJobType.has(JobType.FULLTIME);
    const showPermanent = selectedJobType.has(JobType.PERMANENT);
    const showGPType = selectedDentistType.has('GP');
    const showSpecialistType = selectedDentistType.has('เฉพาะทาง');
    const showOtherSpecialist = selectedSpecialistType.has('อื่น ๆ');

    const specialistTypeData = [
        'Endodontist',
        'Orthodontist',
        'Pedodontist',
        'Prosthodontist',
        'Oral Surgeon',
        'Periodontist',
        'อื่น ๆ'
    ];

    const workingDays =  [
        'วันจันทร์',
        'วันอังคาร',
        'วันพุธ',
        'วันพฤหัสบดี',
        'วันศุกร์',
        'วันเสาร์',
        'วันอาทิตย์',
    ];

    const workingWeeks = [
        'สัปดาห์ที่ 1 ของเดือน',
        'สัปดาห์ที่ 2 ของเดือน',
        'สัปดาห์ที่ 3 ของเดือน',
        'สัปดาห์ที่ 4 ของเดือน'
    ]

    useEffect(() =>
    {
        console.log(showPartTime, showFullTime, showPermanent);
    }, [selectedJobType]);

    return (
        <Form className='w-full max-w-sm mx-auto'>
            <div className='grid grid-cols-2 gap-4'>
                <Select className='col-span-full' selectedKeys={selectedJobType} onSelectionChange={(key) => setSelectedJobType(new Set(key))} label='ประเภทงาน' placeholder='คลิกเพื่อเลือกประเภทงาน' isRequired>
                    {Object.values(JobType).map((j) => (<SelectItem key={j} textValue={j}>{j}</SelectItem>))}
                </Select>
                {
                    showPartTime || showFullTime ? 
                    (
                        <>
                            <DatePicker className='col-span-full' label='วัน/เดือน/ปี' isRequired={showPartTime || showFullTime}/>
                            <TimeInput label='เวลาเริ่มงาน' isRequired={showPartTime || showFullTime}/>
                            <TimeInput label='เวลาเลิกงาน' isRequired={showPartTime || showFullTime}/>
                        </>
                    ) : <></>
                }
                {
                    showPermanent ?
                    (
                        <>
                            <Select className='col-span-full' selectionMode='multiple' selectedKeys={selectedWorkingDays} onSelectionChange={(key) => setSelectedWorkingDays(new Set(key))} label='วันทำงาน' placeholder='คลิกเพื่อเลือกวันทำงาน' isRequired={showPermanent}>
                                {workingDays.map((j) => (<SelectItem key={j} textValue={j}>{j}</SelectItem>))}
                            </Select>
                            <Select className='col-span-full' selectionMode='multiple' selectedKeys={selectedWorkingWeeks} onSelectionChange={(key) => setSelectedWorkingWeeks(new Set(key))} label='สัปดาห์ที่ทำงาน' placeholder='คลิกเพื่อเลือกสัปดาห์ที่ทำงาน' isRequired={showPermanent}>
                                {workingWeeks.map((j) => (<SelectItem key={j} textValue={j}>{j}</SelectItem>))}
                            </Select>
                        </>
                    ) : <></>
                }
                <Input label={'ค่าจ้างประกัน' + (isAveragePay ? ' (เฉลี่ย)' : '')} isRequired/>
                <Input label='DF (%)' isRequired/>
                <Switch className='col-span-full' isSelected={isAveragePay} onValueChange={setIsAveragePay}>เป็นค่าจ้างเฉลี่ยหรือไม่</Switch>
                <Select className='col-span-full' selectedKeys={selectedDentistType} onSelectionChange={(key) => setSelectedDentistType(new Set(key))} label='ประเภททันตแพทย์ที่ต้องการ' placeholder='คลิกเพื่อเลือกประเภททันตแพทย์ที่ต้องการ' isRequired>
                    <SelectItem key='GP' textValue='GP'>GP</SelectItem>
                    <SelectItem key='เฉพาะทาง' textValue='เฉพาะทาง'>เฉพาะทาง</SelectItem>
                </Select>
                {
                    showSpecialistType ?
                    (
                        <>
                            <Select className={showOtherSpecialist ? '' : 'col-span-full'} selectedKeys={selectedSpecialistType} onSelectionChange={(key) => setSelectedSpecialistType(new Set(key))} label='ด้านเฉพาะทาง' placeholder='คลิกเพื่อเลือกประเภททันตแพทย์เฉพาะทาง' isRequired={showSpecialistType}>
                                {specialistTypeData.map((j) => (<SelectItem key={j} textValue={j}>{j}</SelectItem>))}
                            </Select>
                            {
                                showOtherSpecialist ?
                                (
                                    <Input label='ประเภทที่ต้องการ' isRequired={showSpecialistType}/>
                                ) : <></>
                            }
                        </>
                    ) : <></>
                }
                {
                    showGPType ?
                    (
                        <Select className='col-span-full' selectedKeys={selectedJobType} onSelectionChange={(key) => setSelectedJobType(new Set(key))} label='เลือกประเภท GP' placeholder='คลิกเพื่อเลือกประเภท GP' isRequired={showGPType}>
                            {Object.values(GPType).map((j) => (<SelectItem key={j} textValue={j}>{j}</SelectItem>))}
                        </Select>
                    ) : <></>
                }
            </div>
            <Button className='mx-auto' type='submit'>โพสต์</Button>
        </Form>
    );
}

export default SuperUserCreateCompForm;