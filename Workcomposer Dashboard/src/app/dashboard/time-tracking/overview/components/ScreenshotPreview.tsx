"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import API from "@/api";
import { useDashboard } from "@/context/DashboardContext";
import { useOptionalDesktop } from "@/context/DesktopContext";
import { useAppTimezone } from "@/hooks/useAppTimezone";
import { formatDateForApi } from "@/utils/appTimezone";

type Props = {
    userId: string;
    selectedDate: Date;
    onLoaded?: (hasData: boolean) => void;
};

export default function ScreenshotPreview({
    userId,
    selectedDate,
    onLoaded,
}: Props) {
    const router = useRouter();
    const { user } = useDashboard();

    const desktop = useOptionalDesktop();

    const isDesktop = typeof window !== "undefined" && !!window.electronAPI;

    const timezone = useAppTimezone();

    const [screenshots, setScreenshots] = useState<any[]>([]);

    const canViewScreenshots =
        user?.screenshotAccess !== "none";

    useEffect(() => {
        const fetchScreenshots = async () => {
            try {
                const date = formatDateForApi(selectedDate, timezone);

                const res = await API.get(
                    `/screenshots/${userId}?date=${date}`
                );

                setScreenshots(res.data.screenshots);
                onLoaded?.(res.data.screenshots?.length > 0);
            } catch (err) {
                console.error(err);
                onLoaded?.(false);
            }
        };

        fetchScreenshots();
    }, [userId, selectedDate, timezone]);

  useEffect(() => {
        if (!canViewScreenshots) {
            onLoaded?.(true); // don't count this card against the empty state
        }
    }, [canViewScreenshots]);

    if (!canViewScreenshots) {
        return null;
    }


    return (
        <div className="w-full min-w-0">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                    Screenshots
                </h3>

                <button
                    title="View all"
                    onClick={() => {
                        if (isDesktop && desktop) {
                            desktop.setActivePage("reports");
                            desktop.setActiveReport("screenshots");
                        } else {
                            router.push("/dashboard/time-tracking/screenshots");
                        }
                    }}
                    className="text-xs font-semibold cursor-pointer text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded px-2 py-1 shadow-sm">
                    View all
                </button>
            </div>

            <div className="bg-white rounded-lg">
                <div className="grid grid-cols-3 gap-3">

                    {screenshots.length === 0 ? (
                        <div className="col-span-3 flex items-center justify-center h-32 border border-dashed border-gray-300 rounded-lg">
                            <p className="text-sm text-gray-500">
                                No screenshots captured for this day
                            </p>
                        </div>
                    ) : (
                        screenshots.map((shot, index) => {
                            return (
                                <div key={index} className="relative">
                                    <div className="overflow-hidden rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] hover:border-gray-300">

                                        <Image
                                            src={shot.imageUrl}
                                            alt="Screenshot"
                                            width={500}
                                            height={300}
                                            className="w-full h-24 object-cover rounded-t-md"
                                        />

                                        <div className="p-2.5 bg-white border-t border-gray-100">

                                            <div className="flex flex-wrap justify-between items-start mb-1">
                                                <div className="text-xs font-medium text-gray-700 mb-0.5">
                                                    {new Date(
                                                        shot.capturedAt
                                                    ).toLocaleTimeString([], {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        timeZone: timezone,
                                                    })}

                                                </div>

                                                <div
                                                    className="text-xs font-semibold flex items-center gap-1"
                                                    style={{
                                                        color:
                                                            shot.activityScore < 40
                                                                ? "#EF4444"
                                                                : shot.activityScore < 70
                                                                    ? "#F59E0B"
                                                                    : "#22C55E",
                                                    }}
                                                >
                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                shot.activityScore < 40
                                                                    ? "#EF4444"
                                                                    : shot.activityScore < 70
                                                                        ? "#F59E0B"
                                                                        : "#22C55E",
                                                        }}
                                                    />

                                                    {shot.activityScore}%
                                                </div>
                                            </div>

                                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${shot.activityScore}%`,
                                                        backgroundColor:
                                                            shot.activityScore < 40
                                                                ? "#EF4444"
                                                                : shot.activityScore < 70
                                                                    ? "#F59E0B"
                                                                    : "#22C55E",
                                                    }}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}