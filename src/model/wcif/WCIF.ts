import { WCIFEvent } from "./WCIFEvent";
import { WCIFPerson } from "./WCIFPerson";
import { WCIFRegistrationInfo } from "./WCIFRegistrationInfo";
import { WCIFSchedule } from "./WCIFSchedule";

export interface WCIF
{
    formatVersion: string;
    id: string;
    name: string;
    shortName: string;
    series: null | [];
    persons: WCIFPerson[];
    events: WCIFEvent[];
    schedule: WCIFSchedule;
    competitorLimit: number;
    extensions: [];
    registrationInfo: WCIFRegistrationInfo;
}