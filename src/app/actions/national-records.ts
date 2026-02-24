'use server';

import { prisma } from '@/lib/prisma';
import { EventType, NationalRecord, RecordType } from '@prisma/client';
import { Bytes } from '@prisma/client/runtime/library';

interface NationalRecordPayload extends NationalRecord
{
    image?: Bytes;
    newImage?: ReadableStream<Uint8Array<ArrayBuffer>>
}

export async function getNRecentNRs(n: number)
{
    try
    {
        const recentNRs = await prisma.nationalRecord.findMany(
            {
                take: n,
                orderBy:
                {
                    updatedAt: 'desc'
                }
            }
        );

        return recentNRs;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function getAllNRs()
{
    try
    {
        const allNRs = await prisma.nationalRecord.findMany(
            {
                orderBy:
                {
                    id: 'asc'
                }
            }
        );

        const formattedNRs = allNRs.map((record) =>
        (
            {
                ...record,
                imageData: Buffer.from(record.imageData).toString('base64'),
            }
        ));

        return formattedNRs;
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}

export async function submitNR(formData: FormData)
{
    try
    {
        const file = formData.get('file') as File;
    
        if (!file || file.size === 0)
            return { success: false, message: 'No file uploaded' };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const newData = {
            holder: formData.get('holder') as string,
            competition: formData.get('competition') as string,
            result: formData.get('result') as string,
            caption: formData.get('caption') as string,
            event: formData.get('event') as EventType,
            type: formData.get('type') as RecordType,
            imageFileName: file.name,
            mimeType: file.type,
            imageData: buffer
        };

        await prisma.nationalRecord.upsert(
            {
                where:
                {
                    id: Number(formData.get('id')),
                },
                update: newData,
                create: newData
            }
        );

        return { success: true, message: 'Uploaded Successfully' };
    }
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}