import React from 'react';
import { Card, CardHeader, CardFooter, Image } from '@heroui/react';

interface StaffMember
{
    id: string;
    name_en: string;
    name_th: string;
    role_en: string;
    role_th: string;
    imageUrl: string;
};

const staffData: StaffMember[] = [
    {
        id: '1',
        name_en: 'Tanai Chaikraveephand',
        name_th: 'ธนัย ชัยกระวีพันธ์',
        role_en: 'President and WCA Delegate',
        role_th: 'ประธานชมรมฯ และผู้แทนสมาคมลูกบาศก์โลก',
        imageUrl: 'https://avatars.worldcubeassociation.org/uploads/user/avatar/2009CHAI01/1689142187.jpg',
    },
    {
        id: '2',
        name_en: 'Asia Konvittayayotin',
        name_th: 'เอเชีย กรวิทยโยธิน',
        role_en: 'Coordinator',
        role_th: 'ฝ่ายประสานงาน',
        imageUrl: 'https://avatars.worldcubeassociation.org/x8cifal0c9xg7mdyhy1m39tc3aet',
    },
    {
        id: '3',
        name_en: 'Anukun Supcharoenkun',
        name_th: 'อนุกูล ทรัพย์เจริญกุล',
        role_en: 'Human Resources and Finance',
        role_th: 'ฝ่ายบริหารบุคคลและการเงิน',
        imageUrl: 'https://avatars.worldcubeassociation.org/uploads/user/avatar/2009SUPC01/1692862353.jpg',
    },
    {
        id: '4',
        name_en: 'Phakinthorn Pronmongkolsuk',
        name_th: 'ภคินธร พรมงคลสุข',
        role_en: 'Information Technology and Technical Operations',
        role_th: 'ฝ่ายเทคโนโลยีสารสนเทศและงานเทคนิค',
        imageUrl: 'https://avatars.worldcubeassociation.org/5p76i1eotij12e300704ed1l6s40',
    },
    {
        id: '5',
        name_en: 'Phumiphat Rungvichaniwat',
        name_th: 'ภูมิพัฒน์ รุ่งวิชานิวัฒน์',
        role_en: 'Communications and Public Relations',
        role_th: 'ฝ่ายสื่อสารองค์กรและประชาสัมพันธ์',
        imageUrl: 'https://avatars.worldcubeassociation.org/esd7zwpedswpsshbbimq5p1iksm6',
    },
];

const AboutOurMembers = ({locale}: {locale: string}) =>
{
    return (
        <div className='mt-5 mx-8 md:mx-24 mb-10'>
            <div className='mb-8'>
                <p className='text-4xl font-bold'>{locale === 'en' ? 'Our Team' : 'ทีมงานของเรา'}</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                {staffData.map((staff) => (
                    <Card 
                        key={staff.id} 
                        isFooterBlurred 
                        className='w-full h-[300px]'
                    >
                        <CardHeader className='absolute z-10 top-1 flex-col items-start'/>
                        <Image
                            removeWrapper
                            alt={`Portrait of ${staff.name_en}`}
                            className='z-0 w-full h-full object-cover'
                            src={staff.imageUrl}
                        />
                        <CardFooter className='absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100'>
                            <div className='flex flex-col items-start w-full overflow-hidden'>
                                <p className='text-tiny text-white/70 uppercase font-bold w-full truncate text-left'>
                                    {staff[`role_${locale}` as keyof StaffMember]}
                                </p>
                                <h4 className='text-white font-medium text-lg w-full truncate text-left'>
                                    {staff[`name_${locale}` as keyof StaffMember]}
                                </h4>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default AboutOurMembers;