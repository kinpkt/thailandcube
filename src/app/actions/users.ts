'use server';

import { prisma } from '@/lib/prisma';

export async function getUserRole(userId: number) 
{
    try 
    {
        const user = await prisma.user.findUnique(
            {
                where: 
                {
                    id: userId,
                },
                select: 
                {
                    role: true,
                },
            }
        );

        return user?.role || null;
    } 
    catch (error) 
    {
        console.error('Database Error:', error);
        return null;
    }
}