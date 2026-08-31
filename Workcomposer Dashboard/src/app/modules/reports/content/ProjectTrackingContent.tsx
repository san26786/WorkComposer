"use client";

import { useEffect, useState } from "react";
import type { ReportContentProps } from "../types";
import API from "@/api";
import ProjectTrackingCard from "@/app/dashboard/time-tracking/project-tracking/ProjectTrackingCard";
import { useProject } from "@/context/ProjectContext";
import { formatDateForApi } from "@/utils/appTimezone";

export default function ProjectTrackingContent({
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

    const [trackingData, setTrackingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { selectedProject } = useProject();


    useEffect(() => {
        const fetchProjectTracking = async () => {
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

                const { data } = await API.get("/project-tracking", {
                    params: {
                        startDate,
                        endDate,
                        teams: selectedTeams
                            .map((team: any) =>
                                typeof team === "object" ? team._id : team
                            )
                            .filter(Boolean)
                            .join(","),
                        users: selectedUsers.map((u: any) => u._id).join(","),
                        sortBy,
                        order,
                    },
                });

                setTrackingData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectTracking();
    }, [
        reportRange,
        selectedTeams,
        selectedUsers,
        sortBy,
        order,
        refreshKey,
        timezone,
    ]);;

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
                            Please wait while we update the project tracking
                        </p>
                    </div>
                </div>
            ) : (
                <ProjectTrackingCard
                    trackingData={trackingData}
                    reportRange={reportRange}
                />
            )}
        </>
    );
}