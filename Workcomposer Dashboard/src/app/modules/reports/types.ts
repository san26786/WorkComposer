export type ReportContentProps = {
    reportRange: {
        type: string;
        startDate: Date;
        endDate: Date;
    };

    selectedTeams: string[];

    selectedUsers: any[];

    sortBy: string;

    order: string;
};