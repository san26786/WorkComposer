"use client";

import {
    createContext,
    useContext,
} from "react";

type DashboardUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    screenshotAccess?: "none" | "view" | string;
    avatar: string;
    role: string;
    reportTimezone: string;
    permissions?: string[];
    organization?: {
        name: string;
        timezone: string;
    };
};

type DashboardContextType = {
    user: DashboardUser | null;
    refreshUser: () => Promise<void>;
};

const DashboardContext =
    createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error(
            "useDashboard must be used inside DashboardContext.Provider"
        );
    }

    return context;
};

export default DashboardContext;