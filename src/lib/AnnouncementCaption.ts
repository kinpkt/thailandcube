import { WCIF } from '@/model/wcif/WCIF';
import { WCIFEvent } from '@/model/wcif/WCIFEvent';
import { EventCodeToFullMap } from './EnumMapping';

function getAcronym(name: string)
{
    const splitted = name.split(' ');
    let acronym = '';

    for (const word of splitted)
    {
        if (word === 'NxNxN' || word === word.toUpperCase())
            acronym += word;
        else if (word === 'Thailand')
            acronym += 'Th';
        else
            acronym += word[0].toUpperCase();
    }
    
    return acronym;
}

function getDateRange(startDate: string, numberOfDays: number, locale: 'en' | 'th')
{
    const compStart = new Date(startDate);
    const compEnd = new Date(compStart);
    compEnd.setDate(compStart.getDate() + (numberOfDays - 1));

    const startMonth = compStart.toLocaleString(locale === 'th' ? 'th' : 'en-US', { month: 'long' });
    const startDay = compStart.getDate();
    
    const endMonth = compEnd.toLocaleString(locale === 'th' ? 'th' : 'en-US', { month: 'long' });
    const endDay = compEnd.getDate();
    
    const year = compStart.getFullYear();

    if (compStart.getMonth() === compEnd.getMonth())
    {
        if (locale === 'en')
            return `${startMonth} ${startDay} - ${endDay}, ${year}`;
        
        return `${startDay} - ${endDay} ${startMonth} ${year + 543}`;
    }
    
    if (locale === 'en')
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year + 543}`;
}

function getRegistrationString(openTime: string, closeTime: string, locale: 'en' | 'th')
{
    const openDateTime = new Date(openTime);
    const closeDateTime = new Date(closeTime);

    const timeZone = 'Asia/Bangkok';

    if (locale === 'en')
    {
        const openDate = openDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone });
        const openTimeStr = openDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone });
        
        const closeDate = closeDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone });
        const closeTimeStr = closeDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone });

        return `Online registration will be open from ${openDate} at ${openTimeStr} GMT+7 to ${closeDate} at ${closeTimeStr} GMT+7. (Or until the competition is full)`;
    }
    else
    {
        const openDate = openDateTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone });
        const openTimeStr = openDateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
        
        const closeDate = closeDateTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone });
        const closeTimeStr = closeDateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });

        return `เปิดรับสมัคร${openDate} เวลา ${openTimeStr} น. และปิด${closeDate} เวลา ${closeTimeStr} น. (หรือจนกว่าผู้สมัครจะเต็ม)`;
    }
}

function getEvents(events: WCIFEvent[])
{
    const eventNames = events.map((e) => EventCodeToFullMap[e.id.toUpperCase() as keyof typeof EventCodeToFullMap]);

    return eventNames.join(', ');
}

export function generateCaption(wcif: WCIF)
{
    const announcement = `“ ${wcif.name} ”
#${getAcronym(wcif.name)}
-———————————————
🎫 Event: ${getEvents(wcif.events)}
📅 Date: ${getDateRange(wcif.schedule.startDate, wcif.schedule.numberOfDays, 'en')}
วันที่: ${getDateRange(wcif.schedule.startDate, wcif.schedule.numberOfDays, 'th')}
📍 Venue: ${wcif.schedule.venues[0].name}
สถานที่: ${wcif.schedule.venues[0].name}
-———————————————
💵 Registration fee: ${wcif.registrationInfo.baseEntryFee/100} THB, by Credit Card, PromptPay
ค่าสมัคร: ${wcif.registrationInfo.baseEntryFee/100} บาท ชำระด้วยบัตรเครดิต หรือพร้อมเพย์
📆
${getRegistrationString(wcif.registrationInfo.openTime, wcif.registrationInfo.closeTime, 'en')}
${getRegistrationString(wcif.registrationInfo.openTime, wcif.registrationInfo.closeTime, 'th')}
🙎
Competitors limit: ${wcif.competitorLimit}
จำกัดผู้เข้าแข่งขัน ${wcif.competitorLimit} คน
🧑‍🤝‍🧑
Any spectator can attend for free
สามารถเข้าชมการแข่งขันได้ฟรี ไม่มีค่าใช้จ่าย
-———————————————
📜 ตรวจสอบรายละเอียดและสมัครการแข่งขันได้ที่ลิงก์ (หรือสแกน QR Code)
https://www.worldcubeassociation.org/competitions/${wcif.id}
-———————————————
#thailandcube #cubing #speedcubing`;
    
    return announcement;
}