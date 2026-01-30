export interface Venue
{
    name: string;
    cityName: string;
    countryId: string;
    details?: string | null;
    address?: string | null;
    coordinates?:
    {
        lat?: number | string;
        long?: number | string;
    }
}