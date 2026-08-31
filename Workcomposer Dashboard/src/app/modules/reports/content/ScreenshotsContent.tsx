"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import type { ReportContentProps } from "../types";
import ScreenshotCard from "@/app/dashboard/time-tracking/screenshots/ScreenShotsCard";
import { formatDateForApi } from "@/utils/appTimezone";

export default function ScreenshotsContent({
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

    const [screenshots, setScreenshots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const startDate = formatDateForApi(
        reportRange.startDate,
        timezone
    );

    const endDate = formatDateForApi(
        reportRange.endDate,
        timezone
    );

    useEffect(() => {
        const fetchScreenshots = async () => {
            try {
                setLoading(true);

                const { data } = await API.get("/screenshots", {
                    params: {
                        startDate,
                        endDate,
                    },
                });

                setScreenshots(data.screenshots);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchScreenshots();
    }, [startDate, endDate, refreshKey, timezone]);

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
                            Please wait while we update the screenshots
                        </p>
                    </div>
                </div>
            ) : (
                <ScreenshotCard
                    screenshots={screenshots}
                    selectedUsers={selectedUsers}
                    sortBy={sortBy}
                    order={order}
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
        </>
    );
}