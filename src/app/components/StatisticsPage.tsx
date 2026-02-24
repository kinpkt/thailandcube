'use client';

import { EventCodeToFullMap } from '@/lib/EnumMapping';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { NationalRecord } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { Image } from '@heroui/react';

const StatisticsPage = ({NR}: {NR: NationalRecord[] | null}) =>
{
    const t = useTranslations('Statistics');

    const getNRHeader = (record: NationalRecord) =>
    {
        const event = EventCodeToFullMap[record.event];
        const recordType = t(record.type.toLowerCase());
        
        return `${record.result} ${event} ${recordType}`;
    }

    const isEmptyNR = (record: NationalRecord) =>
    {
        return !(record.competition && record.holder && record.result);
    }

    return (
        <>
            <h1 className='text-4xl font-bold'>National Records</h1>
            <div className='max-w-7xl mx-auto px-6 py-8'>
                <div className='grid grid-cols-2 gap-3 mt-5'>
                    {NR
                        ?.filter((r) => !isEmptyNR(r))
                        .map((r) => (
                            <Card className='w-[75%] max-w-[75%] mx-auto' key={r.id}>
                                <CardHeader>
                                    <p className='text-xl font-bold'>{getNRHeader(r)}</p>
                                </CardHeader>
                                <CardBody>
                                    <p className='text-xl font-bold'>{r.holder}</p>
                                    <p>@{r.competition}</p>
                                    <div className='flex justify-center w-full py-4'>
                                        <Image 
                                            src={r.mimeType && r.imageData ? `data:${r.mimeType};base64,${r.imageData}` : '/img/NR/nr-fallback.png'} 
                                            alt={r.caption ?? ''} 
                                            width={300}
                                        />
                                    </div>
                                    <p>{r.caption ? `"${r.caption}"` : ''}</p>
                                </CardBody>
                            </Card>
                        ))
                    }
                </div>
            </div>
        </>
    );
}

// const NRCard = () =>
// {
//     return (
//         <>
//             <Card>
//                 <CardHeader>
//                     <p className='text-2xl font-bold'>{`${record.result} ${EventCodeToFullMap[record.event]} ${record.type.toLocaleLowerCase()}`}</p>
//                 </CardHeader>
//                 <CardBody>
//                     <p className='text-xl font-semibold'>{record.holder}</p>

//                     <input 
//                         type='file' 
//                         ref={fileInputRef} 
//                         onChange={handleFileChange} 
//                         accept='.jpg,.jpeg,.png'
//                         className='hidden' 
//                     />
//                     {!selectedFile ? (
//                         <Button 
//                             variant='bordered'
//                             className='h-24 border-dashed border-2 flex flex-col gap-2'
//                             onPress={handleUploadClick}
//                             endContent={<ArrowUpTrayIcon className='w-5 h-5'/>}
//                         >
//                             Click to upload NR image
//                         </Button>
//                         ) : (
//                         <div className='flex flex-col gap-3'>
//                             {/* Image Preview Area */}
//                             {previewUrl && (
//                                 <div className='relative w-full h-48 rounded-lg overflow-hidden border border-default-200'>
//                                     <Image 
//                                         src={previewUrl} 
//                                         alt='Preview' 
//                                         fill
//                                         unoptimized
//                                         className='w-full h-full object-contain bg-black/5' // object-contain preserves aspect ratio
//                                     />
//                                 </div>
//                             )}

//                             {/* File Info & Remove Button */}
//                             <div className='flex items-center justify-between p-3 border rounded-lg bg-default-50'>
//                                 <div className='flex items-center gap-3'>
//                                     <DocumentArrowUpIcon className='w-8 h-8 text-primary' />
//                                     <div className='flex flex-col'>
//                                         <span className='text-sm font-medium truncate max-w-[200px]'>
//                                             {selectedFile.name}
//                                         </span>
//                                         <span className='text-xs text-default-400'>
//                                             {(selectedFile.size / 1024).toFixed(2)} KB
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <Button
//                                     isIconOnly
//                                     size='sm'
//                                     variant='light'
//                                     color='danger'
//                                     onPress={handleRemoveFile}
//                                 >
//                                     <XMarkIcon className='w-4 h-4' />
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                     <Input label='Caption' type='text' placeholder='ข้อความประกอบ NR'/>
//                 </CardBody>
//                 <CardFooter>
//                     <Button color='success' variant='flat'>Submit</Button>
//                 </CardFooter>
//             </Card>
//         </>
//     );
// }

export default StatisticsPage;