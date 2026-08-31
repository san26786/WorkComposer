"use client";

import API from "@/api";
import { useRouter } from "next/navigation";
import AppUsageChart from "./AppUsageChart";
import { useEffect, useState } from "react";
import { useAppTimezone } from "@/hooks/useAppTimezone";
import { formatDateForApi } from "@/utils/appTimezone";

type Props = { 
    userId: string; 
    selectedDate: any; 
    onLoaded?: (hasData: boolean) => void;
};

export default function TopAppsPreview({ 
    userId, 
    selectedDate, 
    onLoaded,
}: Props) {

    const router = useRouter();
    const timezone = useAppTimezone();
    const [apps, setApps] = useState<any[]>([]);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const date = formatDateForApi(selectedDate, timezone);

                const res = await API.get(
                    `/usage/top-apps/${userId}?date=${date}`
                );

          setApps(res.data); 
                onLoaded?.(res.data?.length > 0);
 
            } catch (err) { 
                console.error(err); 
                onLoaded?.(false);
            }
        };

        fetchApps();
    }, [userId, selectedDate, timezone]);

    const formatTime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);

        return `${h}h ${m}m`;

    };

    return (
        <div className="w-full min-w-0">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    Top apps by usage
                </h3>

                <button
                    title="View all"
                    onClick={() =>
                        router.push("/dashboard/time-tracking/usage")
                    }
                    className="text-xs font-semibold cursor-pointer text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded px-2 py-1 shadow-sm">
                    View all
                </button>
            </div>

            <div className="bg-white rounded-lg p-2">

                <div className="flex items-center gap-2 mt-2">

                    {/* Chart */}
                    <div className="flex-shrink-0">
                        {apps.length > 0 ? (
                            <AppUsageChart data={apps} />
                        ) : (
                            <div className="w-[140px] h-[140px] flex items-center justify-center text-xs text-gray-400">
                                No Data
                            </div>
                        )}
                    </div>

                    {/* Apps */}
                    <div className="flex-1 min-w-0">
                        <div className="space-y-2 h-[125px] overflow-y-auto pr-1">
                            {apps.length > 0 ? (
                                apps.map((app, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center min-w-0">
                                            <div
                                                className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                                                style={{
                                                    backgroundColor: app.color || "#36A2EB",
                                                }}
                                            />

                                            <span
                                                className="text-sm text-gray-700 truncate"
                                                title={app.name}
                                            >
                                                {app.name}
                                            </span>
                                        </div>

                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatTime(app.duration)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 py-4 text-center">
                                    No app usage data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}