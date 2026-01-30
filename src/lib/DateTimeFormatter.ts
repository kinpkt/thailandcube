const MONTHS_ARR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const numToFormatted = (time: number | undefined | null): string =>
{
    if (time === 0)
        return '';

    if (time == null || isNaN(time))
        return 'None';

    if (time === -1)
        return 'DNF';

    if (time === -2)
        return 'DNS';

    if (time < 60)
        return time.toFixed(2);

    const minutes = Math.floor(time/60);
    const seconds = time-60*minutes;

    return `${minutes.toString()}:${seconds.toFixed(2).padStart(5, '0')}`
}

const formattedToNum = (time: string | null | undefined): number =>
{
    if (!time)
        return 0;

    if (time === '')
        return 0;
    if (time === 'DNF')
        return -1;
    if (time === 'DNS')
        return -2;

    const match = time.match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);

    if (!match)
        throw new Error('Invalid time format')

    const minutes = match[1] ? parseInt(match[1]) : 0;
    const seconds = parseFloat(match[2]);

    return minutes * 60 + seconds;
}

const dateToRange = (startDate: Date | string, endDate: Date | string): string =>
{
    if (typeof startDate === 'string')
        startDate = new Date(startDate);

    if (typeof endDate === 'string')
        endDate = new Date(endDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Case 1: 1-day event
    if (startDate.getTime() === endDate.getTime())
        return `${startDate.getDate()} ${MONTHS_ARR[startDate.getMonth()]} ${startDate.getFullYear()}`;
    // Case 2: Same month, different date
    else if (startDate.getDate() !== endDate.getDate() && startDate.getMonth() === endDate.getMonth())
        return `${startDate.getDate()} - ${endDate.getDate()} ${MONTHS_ARR[startDate.getMonth()]} ${startDate.getFullYear()}`;
    // Case 3: Different month
    else if (startDate.getMonth() !== endDate.getMonth())
        return `${startDate.getDate()} ${MONTHS_ARR[startDate.getMonth()]} - ${endDate.getDate()} ${MONTHS_ARR[endDate.getMonth()]} ${startDate.getFullYear()}`;
    // Case 4: Different year
    else
        return `${startDate.getDate()} ${MONTHS_ARR[startDate.getMonth()]} ${startDate.getFullYear()} - ${endDate.getDate()} ${MONTHS_ARR[endDate.getMonth()]} ${endDate.getFullYear()}`;
}

export { MONTHS_ARR, numToFormatted, formattedToNum, dateToRange };