'use client';

import { ArrowPathIcon, ArrowsPointingOutIcon, PauseIcon, PlayIcon } from '@heroicons/react/16/solid';
import { Button, Input } from '@heroui/react';
import { useEffect, useState, useRef } from 'react';

const Page = () =>
{
    const [title, setTitle] = useState('');
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [targetTime, setTargetTime] = useState<Date|null>(null);
    const [isCounting, setIsCounting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const fiveMinsAudioRef = useRef<HTMLAudioElement|null>(null);
    const timesUpAudioRef = useRef<HTMLAudioElement|null>(null);
    const alarmAudioRef = useRef<HTMLAudioElement|null>(null);
    const hasPlayedFiveMinsRef = useRef(false);
    const hasPlayedTimesUpRef = useRef(false);
    const hasPlayedAlarmRef = useRef(false);

    useEffect(() => 
    {
        fiveMinsAudioRef.current = new Audio('/audio/countdown-5-mins-left.mp3');
        timesUpAudioRef.current = new Audio('/audio/countdown-times-up.mp3');
        alarmAudioRef.current = new Audio('/audio/countdown-alarm.mp3');
    }, []);

    const handleStartTimer = () =>
    {
        if (!targetTime)
        {
            const nextOneHour = new Date();
            nextOneHour.setHours(nextOneHour.getHours()+1);
            nextOneHour.setSeconds(nextOneHour.getSeconds()+1);

            // Testing: 5 mins left
            // nextOneHour.setMinutes(nextOneHour.getMinutes()+5);
            // nextOneHour.setSeconds(nextOneHour.getSeconds()+1);

            // Testing: 10 seconds left
            // nextOneHour.setSeconds(nextOneHour.getSeconds()+10);

            toggleFullscreen();
            setTargetTime(nextOneHour);
        }

        if (fiveMinsAudioRef.current)
            fiveMinsAudioRef.current.load();

        if (timesUpAudioRef.current)
            timesUpAudioRef.current.load();

        if (alarmAudioRef.current)
            alarmAudioRef.current.load();

        setIsCounting(true);
    }

    const handlePauseTimer = () => 
    {
        setIsCounting(false);
    };

    const handleResetTimer = () => 
    {
        setIsCounting(false);
        setTargetTime(null);
        setHours(1);
        setMinutes(0);
        setSeconds(0);

        hasPlayedFiveMinsRef.current = false;
        hasPlayedTimesUpRef.current = false;
        hasPlayedAlarmRef.current = false;
    };

    useEffect(() =>
    {
        const interval = setInterval(() => 
        {
            if (isCounting && targetTime)
            {
                const now = new Date();
                const diff = targetTime.getTime() - now.getTime();

                if (diff <= 5*60*1000 && diff > 0 && !hasPlayedFiveMinsRef.current) 
                {
                    if (fiveMinsAudioRef.current)
                        fiveMinsAudioRef.current.play().catch(e => console.log('Audio blocked:', e));

                    hasPlayedFiveMinsRef.current = true;
                }

                if (diff <= 0)
                {
                    setIsCounting(false);

                    if (alarmAudioRef.current)
                    {
                        alarmAudioRef.current.play().catch(e => console.log('Audio blocked:', e));

                        setTimeout(() => 
                        {
                            if (alarmAudioRef.current) 
                            {
                                alarmAudioRef.current.pause();
                                alarmAudioRef.current.currentTime = 0;
                            }
                        }, 7.5*1000);
                    }

                    hasPlayedAlarmRef.current = true;

                    if (timesUpAudioRef.current)
                        timesUpAudioRef.current.play().catch(e => console.log('Audio blocked:', e));

                    hasPlayedTimesUpRef.current = true;

                    return;
                }

                const hrs = Math.floor((diff % (1000*60*60*24))/(1000*60*60));
                setHours(hrs);

                const min = Math.floor((diff % (1000*60*60))/(1000*60));
                setMinutes(min);

                const sec = Math.floor((diff % (1000*60))/1000);
                setSeconds(sec);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isCounting, targetTime]);

    const toggleFullscreen = () => 
    {
        if (!document.fullscreenElement) 
            document.documentElement.requestFullscreen();
        else 
            document.exitFullscreen();
    };

    useEffect(() =>
    {
        const handleFullscreenChange = () =>
        {
            setIsFullscreen(!!document.fullscreenElement);
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const format = (num: number) => num.toString().padStart(2, '0');

    return (
        <>
            <div className='container mx-auto'>
                <div className='my-10'>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} variant='underlined' color='primary' placeholder='Title' classNames={{input: 'text-4xl font-bold text-center', inputWrapper: 'shadow-none'}}/>
                </div>

                <div className='flex justify-center mt-10 gap-3'>
                    <span className='flex flex-col justify-center items-center text-9xl w-48 py-3 shadow-lg rounded-lg'>
                        {hours}
                        <p className='text-lg uppercase font-semibold'>
                        Hour
                        </p>
                    </span>
                    <span className='flex flex-col justify-center items-center text-9xl w-48 py-3 shadow-lg rounded-lg'>
                        {format(minutes)}
                        <p className='text-lg uppercase font-semibold'>
                        Minutes
                        </p>
                    </span>
                    <span className='flex flex-col justify-center items-center text-9xl w-48 py-3 shadow-lg rounded-lg'>
                        {format(seconds)}
                        <p className='text-lg uppercase font-semibold'>
                        Seconds
                        </p>
                    </span>
                </div>
                
                <div className={`flex justify-center items-center mt-10 gap-4 mx-auto ${isFullscreen ? 'hidden' : ''}`}>
                    <Button onPress={handleStartTimer} color='success' variant='flat' className='w-24 h-24 min-w-[6rem] rounded-xl' isIconOnly><PlayIcon className='w-10 h-10'/></Button>
                    <Button onPress={handlePauseTimer} color='warning' variant='flat' className='w-24 h-24 min-w-[6rem] rounded-xl' isIconOnly><PauseIcon className='w-10 h-10'/></Button>
                    <Button onPress={handleResetTimer} color='primary' variant='flat' className='w-24 h-24 min-w-[6rem] rounded-xl' isIconOnly><ArrowPathIcon className='w-10 h-10'/></Button>
                </div>

                <div className='flex justify-center mt-5'>
                    <Button onPress={toggleFullscreen} className={isFullscreen ? 'hidden' : ''}><ArrowsPointingOutIcon className='w-5 h-5'/> Click for fullscreen</Button>
                </div>
            </div>
        </>
    );
}

export default Page;