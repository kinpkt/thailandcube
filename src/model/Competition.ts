import { Venue } from './Venue';

export interface Competition
{
    id: string;
    competitionId?: string;
    proposalId?: number | null;
    name: string;
    shortName: string | null;
    nameReason: string | null;
    venue: string | Venue;
    startDate: string | Date; // Serialized Date
    endDate: string | Date; // Serialized Date
    series?: CompetitionSeries;
    information?: string | null;
    competitorLimit?:
    {
        enabled?: boolean | null;
        count?: number | null;
        reason?: string | null;
        autoCloseThreshold?: number | null;
        newcomerMonthReservedSpots?: number | null;
        autoAcceptPreference: 'disabled' | 'bulk' | 'live';
        autoAcceptDisableThreshold?: number | null;
    }
    staff?:
    {
        staffDelegateIds: number[];
        traineeDelegateIds: number[];
        organizerIds: number[];
        contact?: string | null;
    }
    championships?: string[];
    website?: 
    {
        generateWebsite?: boolean | null;
        externalWebsite?: string | null;
        externalRegistrationPage?: string | null;
        usesWcaRegistration: boolean;
        usesWcaLive: boolean;
    }
    userSettings?:
    {
        receiveRegistrationEmails: boolean;
    }
    entryFees?:
    {
        currencyCode: string;
        baseEntryFee?: number | null;
        onTheSpotEntryFee?: number | null;
        guestEntryFee?: number | null;
        donationsEnabled?: boolean | null;
        refundPolicyPercent?: number | null;
        refundPolicyLimitDate: string; // Serialized DateTime
    }
    registration?:
    {
        openingDateTime: string; // Serialized DateTime
        closingDateTime: string; // Serialized DateTime
        waitingListDeadlineDate: string; // Serialized DateTime
        eventChangeDeadlineDate: string; // Serialized DateTime
        allowOnTheSpot?: boolean | null;
        competitorCanCancel: 'not_accepted' | 'always' | 'unpaid';
        allowSelfEdits: boolean;
        guestsEnabled: boolean;
        guestEntryStatus: string;
        guestsPerRegistration?: number | null;
        extraRequirements?: string | null;
        forceComment?: boolean | null;
    }
    eventRestrictions?:
    {
        forbidNewcomers:
        {
            enabled: boolean;
            reason?: string | null;
        }
        earlyPuzzleSubmission:
        {
            enabled: boolean;
            reason?: string | null;
        }
        qualificationResults:
        {
            enabled: boolean;
            reason?: string | null;
            allowRegistrationWithout?: boolean | null;
        }
        eventLimitation:
        {
            enabled: boolean;
            reason?: string | null;
            perRegistrationLimit?: number | null;
        }
        mainEventId?: string;
    }
    remarks?: string | null;
    admin?: 
    {
        isConfirmed: boolean;
        isVisible: boolean;
    }
    cloning?:
    {
        fromId?: string | null;
        cloneTabs: boolean;
    }
}

interface CompetitionSeries
{
    id?: number | null;
    seriesId: string;
    name: string;
    shortName: string;
    competitionIds: string[];
}