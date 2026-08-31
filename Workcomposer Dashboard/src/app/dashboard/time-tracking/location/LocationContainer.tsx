"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import LiveMap from "./LiveMap";
import { formatDateForApi } from "@/utils/appTimezone";
import { useTimeTracking } from "@/context/TimeTrackingContext";

type Props = {
    reportRange?: {
        startDate: Date;
        endDate: Date;
    };
    selectedTeams?: string[];
    selectedUsers?: any[];
    sortBy?: string;
    order?: string;
    refreshKey?: number;
    isRefreshing?: boolean;
};

export default function LocationContainer({
    reportRange,
    selectedTeams = [],
    selectedUsers = [],
    sortBy = "name",
    order = "asc",
    refreshKey = 0,
    isRefreshing = false,
}: Props) {

    const { timezone } = useTimeTracking();

    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true);
                const startDate = formatDateForApi(
                    reportRange?.startDate || new Date(),
                    timezone
                );

                const endDate = formatDateForApi(
                    reportRange?.endDate || new Date(),
                    timezone
                );

                const { data } = await API.get("/locations", {
                    params: {
                        startDate,
                        endDate,
                        teams: selectedTeams.join(","),
                        users: selectedUsers
                            .map((u: any) => u._id)
                            .join(","),
                        sortBy,
                        order,
                    },
                });

                setLocations(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();

        const interval = setInterval(fetchLocations, 5000);

        return () => clearInterval(interval);
    }, [
        reportRange,
        selectedTeams,
        selectedUsers,
        sortBy,
        order,
        refreshKey,
        timezone,
    ]);

    return (
        <div className="relative h-full">
            <LiveMap locations={locations} />

            {(loading && isRefreshing) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[2px]">
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
                            Please wait while we update the locations
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}