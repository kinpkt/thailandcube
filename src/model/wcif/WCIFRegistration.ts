export interface WCIFRegistration
{
    wcaRegistrationId: number;
    eventIds: string[];
    status: string;
    isCompeting: boolean;
    guests?: number;
    comments?: string;
    administrativeNotes?: string;
}