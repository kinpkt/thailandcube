'use client';

import { generateCaption } from '@/lib/AnnouncementCaption';
import { WCIF } from '@/model/wcif/WCIF';
import { Button, Code, Input } from '@heroui/react';
import { useState } from 'react';

const CaptionGenerator = () =>
{
    const [compId, setCompId] = useState('');
    const [wcif, setWCIF] = useState<WCIF>();
    const [caption, setCaption] = useState('');
    const [isHidden, setIsHidden] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const fetchWCIF = async () =>
    {
        if (!compId)
            return;

        try
        {
            const response = await fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${compId}/wcif/public`);
            
            if (response.ok)
            {
                const data = await response.json();
                setWCIF(data);
                setCaption(generateCaption(data));
                setIsHidden(false);
            }
            else
                console.error('Failed to fetch WCIF data.');
        }
        catch (error)
        {
            console.error('Error fetching data:', error);
        }
    };

    const handleCopy = () =>
    {
        navigator.clipboard.writeText(caption);
        setIsCopied(true);
        
        setTimeout(() =>
        {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <>
            <h1 className='text-3xl mb-5'>Caption Generator (For Posting WCA Comps)</h1>
            <div className='mx-auto w-[25%] bg-primary-50 px-5 py-5 rounded-2xl mb-8'>
                <Input 
                    className='mb-2' 
                    label='WCA Competition ID' 
                    placeholder='e.g. ThailandChampionship2025'
                    value={compId}
                    onValueChange={setCompId}
                />
                <Button color='success' variant='flat' onPress={fetchWCIF}>
                    Get WCIF
                </Button>
            </div>

            <div className='mx-auto w-[75%] border border-default-200 rounded-xl overflow-hidden' hidden={isHidden}>
                <div className='flex justify-between items-center bg-default-100 px-4 py-2 border-b border-default-200'>
                    <span className='text-xl font-semibold text-default-700'>Caption For {wcif?.name}</span>
                    <Button 
                        color={isCopied ? 'success' : 'default'} 
                        variant='flat' 
                        size='sm' 
                        onPress={handleCopy}
                    >
                        {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                </div>

                <div className='p-4 bg-white'>
                    <Code className='whitespace-pre-wrap block w-full text-left'>
                        {caption}
                    </Code>
                </div>
            </div>
        </>
    );
}

export default CaptionGenerator;