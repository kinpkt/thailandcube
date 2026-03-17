import { WCIFRound } from "./WCIFRound";

export interface WCIFEvent
{
    id: string;
    rounds: WCIFRound[];
    extensions: [];
    qualification: null;
}