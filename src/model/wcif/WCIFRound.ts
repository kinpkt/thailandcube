interface WCIFTimeLimit
{
    centiseconds: number;
    cumulativeRoundIds: string[];
}

interface WCIFCutoff
{
    numberOfAttempts: number;
    attemptResult: number
}

interface WCIFAdvancementCondition
{
    type: string;
    level: number;
}

export interface WCIFRound
{
    id: string;
    format: string;
    timeLimit: WCIFTimeLimit;
    cutoff: WCIFCutoff | null;
    advancementCondition: WCIFAdvancementCondition | null;
    scrambleSetCount: number;
    results: [];
    extensions: [];
}