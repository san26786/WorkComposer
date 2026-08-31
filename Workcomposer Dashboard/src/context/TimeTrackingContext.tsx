"use client";

import { createContext, useContext } from "react";

type TimeTrackingContextType = {
    timezone: string;

    date: Date;
    setDate: React.Dispatch<React.SetStateAction<Date>>;

    reportRange: {
        type: string;
        startDate: Date;
        endDate: Date;
    };

    setReportRange: React.Dispatch<
        React.SetStateAction<{
            type: string;
            startDate: Date;
            endDate: Date;
        }>
    >;

    selectedTeams: any[];
    setSelectedTeams: React.Dispatch<React.SetStateAction<any[]>>;

    selectedUsers: any[];
    setSelectedUsers: React.Dispatch<React.SetStateAction<any[]>>;

    users: any[];

    refreshKey: number;
    isRefreshing: boolean;
    handleRefresh: () => Promise<void>;

    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;

    order: string;
    setOrder: React.Dispatch<React.SetStateAction<string>>;
};

const TimeTrackingContext =
    createContext<TimeTrackingContextType | null>(null);

export const useTimeTracking = () => {
    const context = useContext(TimeTrackingContext);

    if (!context) {
        throw new Error(
            "useTimeTracking must be used inside TimeTrackingContext.Provider"
        );
    }

    return context;
};

export default TimeTrackingContext;