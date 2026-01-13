import { NextResponse } from 'next/server';

export async function GET(req: Request)
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
        const URL = `${process.env.WCA_URL}/api/v0/me`;

        console.log('Going to ', URL);

        const res = await fetch(URL,
        {
            headers:
            {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!res.ok)
        {
            const text = await res.text();
            return NextResponse.json(
                { error: 'WCA error', details: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    }
    catch (err)
    {
        console.error(err);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}