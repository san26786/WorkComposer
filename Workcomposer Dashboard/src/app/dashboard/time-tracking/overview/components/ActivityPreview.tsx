"use client";

import { BiExpand } from "react-icons/bi";
import { BsBarChart } from "react-icons/bs";
import ActivityChart from "./ActivityChart";
import { useEffect, useState } from "react";
import ActivityDetailsModal from "./ActivityDetailsModal";
import API from "@/api";
import { useAppTimezone } from "@/hooks/useAppTimezone";
import { formatDateForApi } from "@/utils/appTimezone";

type Props = {
    userId: string;
    selectedDate: Date;
    workTime: string;
    userName: string;
    onLoaded?: (hasData: boolean) => void;
};

export default function ActivityPreview({
    userId,
    selectedDate,
    workTime,
    userName,
    onLoaded,
}: Props) {
    const timezone = useAppTimezone();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activityData, setActivityData] = useState<
        {
            time: string;
            value: number;
            color?: string;
        }[]
    >([]);

    const [activityScore, setActivityScore] = useState(0);
    const [idleTime, setIdleTime] = useState(0);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const date = formatDateForApi(selectedDate, timezone);

                const res = await API.get(
                    `/activity/${userId}?date=${date}`
                );

                const activity = Array.isArray(res.data.activity)
                    ? res.data.activity
                    : [];

                setActivityData(activity);
                setActivityScore(res.data.activityScore || 0);
                setIdleTime(res.data.idleTime || 0);

                const hasData = activity.some(
                    (item: any) => Number(item.value) > 0
                );

                onLoaded?.(hasData);
            } catch (err) {
                console.error(err);

                setActivityData([]);
                setActivityScore(0);
                setIdleTime(0);

                onLoaded?.(false);
            }
        };

        fetchActivity();
    }, [userId, selectedDate, timezone, onLoaded]);

    const hasActivityData = activityData.some(
        (item) => item.value > 0
    );

    return (
        <div className="w-full min-w-0 max-w-full overflow-hidden">
            {/* Header */}
            <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                <h3 className="min-w-0 truncate text-lg font-semibold text-gray-900">
                    Activity Levels
                </h3>

                <button
                    type="button"
                    title="View details"
                    onClick={() => setIsModalOpen(true)}
                    className="shrink-0 cursor-pointer rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-100"
                >
                    View Details
                </button>
            </div>

            {/* Activity card */}
            <div
                className="
                    w-full
                    min-w-0
                    max-w-full
                    overflow-hidden
                    rounded-lg
                    bg-white
                    p-1.5
                "
            >
                {/* Score */}
                {hasActivityData ? (
                    <div className="mb-1 min-w-0">
                        <div className="mb-0.5 flex min-w-0 items-center justify-between gap-2 text-sm">
                            <div className="flex min-w-0 items-center gap-1">
                                <span className="shrink-0 font-medium text-gray-700">
                                    Activity Score:
                                </span>

                                <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-sm font-semibold text-yellow-800">
                                    {activityScore}%
                                </span>
                            </div>

                            <span className="shrink-0 text-xs text-gray-500">
                                {idleTime}% idle time
                            </span>
                        </div>

                        {/* Progress */}
                        <div className="relative min-w-0">
                            <div
                                className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200"
                                title="Click to see detailed activity chart"
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${Math.min(
                                            Math.max(activityScore, 0),
                                            100
                                        )}%`,
                                        backgroundColor:
                                            activityScore < 40
                                                ? "#EF4444"
                                                : activityScore < 70
                                                  ? "#F59E0B"
                                                  : "#22C55E",
                                    }}
                                />
                            </div>

                            <div className="mt-0.5 flex justify-between text-[11px] leading-none text-gray-500">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-2 min-w-0">
                        <div className="flex min-w-0 items-center justify-between gap-2 text-sm">
                            <span className="shrink-0 font-medium text-gray-500">
                                Activity Status
                            </span>

                            <span className="min-w-0 truncate rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                No activity recorded
                            </span>
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div
                    className="
                        relative
                        h-[90px]
                        min-h-0
                        w-full
                        min-w-0
                        max-w-full
                        overflow-hidden
                    "
                >
                    {hasActivityData ? (
                        <>
                            {/* 
                              Important:
                              The chart is contained inside this wrapper.
                              This prevents SVG/canvas/chart internals from
                              overflowing into the next user's card.
                            */}
                            <div className="h-full w-full min-w-0 max-w-full overflow-hidden">
                                <ActivityChart data={activityData} />
                            </div>

                            {/* Expand button */}
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="
                                    absolute
                                    right-0
                                    top-0
                                    z-10
                                    rounded-md
                                    bg-white/80
                                    p-1
                                    shadow-sm
                                    backdrop-blur-sm
                                    transition-colors
                                    hover:bg-white
                                "
                                aria-label="View activity details"
                                title="View activity details"
                            >
                                <BiExpand className="h-4 w-4 text-indigo-500" />
                            </button>
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
                            <div className="flex flex-col items-center justify-center px-2 text-center">
                                <BsBarChart className="mb-1 h-5 w-5 text-gray-300" />

                                <p className="text-xs font-medium text-gray-500">
                                    No activity data
                                </p>

                                <p className="mt-0.5 text-[10px] text-gray-400">
                                    No activity recorded for the selected date
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <ActivityDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activityData={activityData}
                selectedDate={selectedDate}
                workTime={workTime}
                userName={userName}
            />
        </div>
    );
}