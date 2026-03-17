interface WCIFVenue
{
    id: number;
    name: string;
    latitudeMicrodegrees: number;
    longitudeMicrodegrees: number;
    countryIso2: string;
    timezone: string;
    rooms: WCIFRoom[];
    extensions: [];
}

interface WCIFRoom
{
    id: number;
    name: string;
    color: string;
    activities: WCIFActivity[];
    extensions: [];
}

interface WCIFActivity
{
    id: number;
    name: string;
    activityCode: string;
    startTime: string;
    endTime: string;
    childActivities: WCIFActivity[];
    extensions: [];
}

export interface WCIFSchedule
{
    startDate: string;
    numberOfDays: number;
    venues: WCIFVenue[];
}