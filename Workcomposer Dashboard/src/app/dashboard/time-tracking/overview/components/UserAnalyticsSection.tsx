"use client";

import TopAppsPreview from "./TopAppsPreview";
import ActivityPreview from "./ActivityPreview";
import ScreenshotPreview from "./ScreenshotPreview";
import { useDashboard } from "@/context/DashboardContext";

type Props = {
    userId: string;
    selectedDate: Date;
    workTime: string;
    userName: string;
};

export default function UserAnalyticsSection({
    userId,
    selectedDate,
    workTime,
    userName,
}: Props) {
    const { user } = useDashboard();

    const canViewScreenshots =
        user?.screenshotAccess !== "none";

    return (
        <div className="mt-3 w-full min-w-0 overflow-visible">
            <div
                className={`
                    grid
                    w-full
                    min-w-0
                    grid-cols-1
                    gap-5
                    overflow-visible
                    ${
                        canViewScreenshots
                            ? "xl:grid-cols-12"
                            : "xl:grid-cols-8"
                    }
                `}
            >
                {/* ================================================= */}
                {/* SCREENSHOTS                                        */}
                {/* ================================================= */}

                {canViewScreenshots && (
                    <div className="w-full min-w-0 xl:col-span-5">
                        <ScreenshotPreview
                            userId={userId}
                            selectedDate={selectedDate}
                        />
                    </div>
                )}

                {/* ================================================= */}
                {/* TOP APPS                                           */}
                {/* ================================================= */}

                <div
                    className={`
                        w-full
                        min-w-0
                        ${
                            canViewScreenshots
                                ? "xl:col-span-3"
                                : "xl:col-span-4"
                        }
                    `}
                >
                    <TopAppsPreview
                        userId={userId}
                        selectedDate={selectedDate}
                    />
                </div>

                {/* ================================================= */}
                {/* ACTIVITY                                           */}
                {/* ================================================= */}

                <div
                    className={`
                        w-full
                        min-w-0
                        ${
                            canViewScreenshots
                                ? "xl:col-span-4"
                                : "xl:col-span-4"
                        }
                    `}
                >
                    <ActivityPreview
                        userId={userId}
                        selectedDate={selectedDate}
                        workTime={workTime}
                        userName={userName}
                    />
                </div>
            </div>
        </div>
    );
}