import { WCIFRegistration } from "./WCIFRegistration";

interface WCIFAvatar
{
    url: string;
    thumbUrl: string;
}

export interface WCIFPerson
{
    name: string;
    wcaUserId: number;
    wcaId: string | null;
    registrantId: number;
    countryIso2: string;
    gender: string;
    registration: WCIFRegistration;
    avatar: WCIFAvatar;
    roles: string[];
    assignments: [];
    personalBests: [];
    extensions: []
}