import Competitor from '@/model/Competitor';

export default interface Result
{
    eventID?: string;
    eventRound?: number;
    competitor: Competitor;
    attempts: number[];
    result: number|null;
    best: number|null;
    rank?: number;
}