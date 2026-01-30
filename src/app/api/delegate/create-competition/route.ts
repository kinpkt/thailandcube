import { NextResponse } from 'next/server';
import axios from 'axios';
import SampleCompetition from '@/data/sample-competition.json';

export async function POST(req: Request)
{
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer '))
    {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    try
    {
        const res = await axios.post(
            `${process.env.WCA_URL}/api/v0/competitions`,
            SampleCompetition,
            {
                headers:
                {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return NextResponse.json(res.data);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any)
    {
        console.error('WCA create error:', error.response?.data || error.message);

        return NextResponse.json(
            {
                error: 'Failed to create competition',
                details: error.response?.data,
            },
            { status: error.response?.status ?? 500 }
        );
    }
}