"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import type { ReportContentProps } from "../types";
import WebAppUsageCard from "@/app/dashboard/time-tracking/usage/WebAppUsageCard";
import { formatDateForApi } from "@/utils/appTimezone";

export default function UsageContent({
    reportRange,
    selectedTeams,
    selectedUsers,
    sortBy,
    order,
    refreshKey,
    isRefreshing,
    timezone,
}: ReportContentProps & {
    refreshKey: number;
    isRefreshing: boolean;
    timezone: string;
}) {

    const [usageData, setUsageData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const fetchAllUsers = async () => {
        try {
            const { data } = await API.get("/users/all-users", {
                params: {
                    page: 1,
                    limit: 1000,
                },
            });

            const users = Array.isArray(data?.users)
                ? data.users
                : Array.isArray(data)
                    ? data
                    : [];

            setAllUsers(users);
        } catch (err) {
            console.error("FAILED TO FETCH USERS:", err);
            setAllUsers([]);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchUsage = async () => {
        try {
            setLoading(true);

            const startDate = formatDateForApi(
                reportRange.startDate,
                timezone
            );

            const endDate = formatDateForApi(
                reportRange.endDate,
                timezone
            );

            const { data } = await API.get("/usage", {
                params: {
                    startDate,
                    endDate,
                    users: selectedUsers.map((u: any) => u._id).join(","),
                    teams: selectedTeams
                        .map((team: any) =>
                            typeof team === "object" ? team._id : team
                        )
                        .filter(Boolean)
                        .join(","),
                    sortBy,
                    order,
                },
            });

            setUsageData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsage();
    }, [
        reportRange,
        selectedUsers,
        selectedTeams,
        sortBy,
        order,
        refreshKey,
        timezone,
    ]);

    useEffect(() => {
        const selectedDate = formatDateForApi(
            reportRange.startDate,
            timezone
        );

        const today = formatDateForApi(
            new Date(),
            timezone
        );

        if (selectedDate !== today) {
            return;
        }

        const interval = setInterval(() => {
            fetchUsage();
        }, 30000);

        return () => clearInterval(interval);

    }, [reportRange]);

    return (
        <>
            {loading || isRefreshing ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative h-12 w-12">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400" />

                            <div className="absolute inset-2 rounded-full bg-white" />

                            <div className="absolute inset-[14px] animate-pulse rounded-full bg-indigo-600" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-700">
                            Fetching content...
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Please wait while we update the usage
                        </p>
                    </div>
                </div>
            ) : (
                <WebAppUsageCard
                    usageData={usageData}
                    allUsers={allUsers}
                    reportRange={reportRange}
                />
            )}
        </>
    );
}