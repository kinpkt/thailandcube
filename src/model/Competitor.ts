export default interface Competitor
{
    id: number;
    wcaId: string | null;
    name: string;
    region: string | null;
    events?: boolean[]; // 333NI, 333OH, 333BF, MB
}