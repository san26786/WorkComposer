"use client";

import Image from "next/image";
import {
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useRef, useState } from "react";
import ScreenshotDetailsModal from "./ScreenshotDetailsModal";

type Props = {
    user: {
        email: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
        screenshots: any[];
    };
    onClose: () => void;
};

export default function ScreenshotModal({
    user,
    onClose,
}: Props) {
    const [currentHour, setCurrentHour] = useState<string | null>(null);

    /**
     * Stores the currently selected screenshot index
     * separately for every hour.
     *
     * Example:
     * {
     *   "9 AM": 2,
     *   "10 AM": 0,
     *   "11 AM": 4
     * }
     */
    const [hourIndexes, setHourIndexes] = useState<
        Record<string, number>
    >({});

    /**
     * Separate horizontal scroll container for every hour.
     */
    const rowRefs = useRef<
        Record<string, HTMLDivElement | null>
    >({});

    /**
     * Keep newest screenshots first.
     */
    const sortedScreenshots = [...user.screenshots].sort(
        (a, b) =>
            new Date(b.capturedAt).getTime() -
            new Date(a.capturedAt).getTime()
    );

    /**
     * Group screenshots by hour.
     */
    const groupedByHour = sortedScreenshots.reduce(
        (acc: Record<string, any[]>, shot: any) => {
            const hourKey = new Date(
                shot.capturedAt
            ).toLocaleString([], {
                hour: "numeric",
                hour12: true,
            });

            if (!acc[hourKey]) {
                acc[hourKey] = [];
            }

            acc[hourKey].push(shot);

            return acc;
        },
        {}
    );

    const hourKeys = Object.keys(groupedByHour);

    /**
     * Current hour used by ScreenshotDetailsModal.
     */
    const activeHour =
        currentHour ?? hourKeys[0] ?? null;

    const activeHourScreenshots: any[] = activeHour
        ? (groupedByHour[activeHour] ?? [])
        : [];

    const currentIndexInHour =
        hourIndexes[activeHour ?? ""] ?? 0;

    const activeScreenshot =
        activeHourScreenshots[currentIndexInHour] ?? null;

    const totalInHour =
        activeHourScreenshots.length;

    /**
     * Move screenshot inside the currently active hour.
     *
     * This is kept for ScreenshotDetailsModal navigation.
     */
    const goToIndexInHour = (index: number) => {
        if (!activeHour) return;

        const clamped = Math.max(
            0,
            Math.min(
                index,
                totalInHour - 1
            )
        );

        setHourIndexes((prev) => ({
            ...prev,
            [activeHour]: clamped,
        }));

        rowRefs.current[activeHour]?.scrollTo({
            left: clamped * 275,
            behavior: "smooth",
        });
    };

    const [
        selectedScreenshot,
        setSelectedScreenshot,
    ] = useState<any>(null);

    /**
     * Activity color helper.
     */
    const getActivityColor = (score: number) => {
        if (score < 40) return "#EF4444";
        if (score < 70) return "#F59E0B";
        return "#22C55E";
    };

    return (
        <>
            <div
                role="dialog"
                aria-modal="true"
                className="relative z-50"
            >
                {/* ===================================================== */}
                {/* BACKDROP */}
                {/* ===================================================== */}

                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                {/* ===================================================== */}
                {/* MODAL POSITIONING                                     */}
                {/* ===================================================== */}
                {/*
                    IMPORTANT:
                    No overflow-y-auto here.

                    This prevents a second vertical scrollbar.
                */}
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="w-full max-w-7xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
                    >
                        {/* ================================================= */}
                        {/* MODAL HEADER */}
                        {/* ================================================= */}

                        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    {user.avatar?.trim() ? (
                                        <Image
                                            src={user.avatar}
                                            alt={
                                                `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                                                user.email
                                            }
                                            width={32}
                                            height={32}
                                            unoptimized
                                            className="mr-2.5 h-8 w-8 rounded-full object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="mr-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-200 font-semibold text-green-700">
                                            {user.firstName
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase() ||
                                                "U"}
                                        </div>
                                    )}

                                    <h3 className="text-base font-semibold text-gray-800">
                                        {user.email}&apos;s
                                        Screenshots
                                    </h3>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                                aria-label="Close dialog"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* ================================================= */}
                        {/* MODAL CONTENT */}
                        {/* ================================================= */}

                        <div className="p-5">
                            {/*
                                THIS IS THE ONLY VERTICAL SCROLLER.

                                Each hour below owns its own horizontal
                                scrolling container.
                            */}
                            <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2">
                                <div className="space-y-6">
                                    {Object.entries(
                                        groupedByHour
                                    ).map(
                                        ([
                                            hour,
                                            screenshots,
                                        ]: [
                                                string,
                                                any[],
                                            ]) => {
                                            /*
                                             * Each hour has its own
                                             * independent index.
                                             */
                                            const hourIndex =
                                                hourIndexes[
                                                hour
                                                ] || 0;

                                            const hourActiveScreenshot =
                                                screenshots[
                                                hourIndex
                                                ] ||
                                                screenshots[0];

                                            const isFirst =
                                                hourIndex ===
                                                0;

                                            const isLast =
                                                hourIndex >=
                                                screenshots.length -
                                                1;

                                            /**
                                             * Navigate ONLY inside
                                             * this hour.
                                             */
                                            const goToHourScreenshot =
                                                (
                                                    index: number
                                                ) => {
                                                    const clampedIndex =
                                                        Math.max(
                                                            0,
                                                            Math.min(
                                                                index,
                                                                screenshots.length -
                                                                1
                                                            )
                                                        );

                                                    setCurrentHour(
                                                        hour
                                                    );

                                                    setHourIndexes(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,
                                                            [hour]:
                                                                clampedIndex,
                                                        })
                                                    );

                                                    /*
                                                     * Scroll only this
                                                     * hour's row.
                                                     */
                                                    rowRefs.current[
                                                        hour
                                                    ]?.scrollTo(
                                                        {
                                                            left:
                                                                clampedIndex *
                                                                275,
                                                            behavior:
                                                                "smooth",
                                                        }
                                                    );
                                                };

                                            return (
                                                <div
                                                    key={hour}
                                                    className="min-w-0"
                                                >
                                                    {/* ========================================= */}
                                                    {/* HOUR CONTROL BAR                         */}
                                                    {/* ========================================= */}

                                                    <div className="relative flex min-h-[56px] items-center justify-between rounded-t-lg border border-gray-200 bg-white px-3 shadow-sm">
                                                        {/* TIME + DATE */}

                                                        <div className="flex items-center rounded-md bg-indigo-50 px-3 py-1.5">
                                                            <span className="text-sm font-semibold text-indigo-700">
                                                                {hourActiveScreenshot
                                                                    ? new Date(
                                                                        hourActiveScreenshot.capturedAt
                                                                    ).toLocaleTimeString(
                                                                        [],
                                                                        {
                                                                            hour: "numeric",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )
                                                                    : "--"}
                                                            </span>

                                                            <span className="ml-1.5 text-xs font-medium text-indigo-500">
                                                                {hourActiveScreenshot
                                                                    ? new Date(
                                                                        hourActiveScreenshot.capturedAt
                                                                    ).toLocaleDateString(
                                                                        [],
                                                                        {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                        }
                                                                    )
                                                                    : "--"}
                                                            </span>
                                                        </div>

                                                        {/* ========================================= */}
                                                        {/* HOUR NAVIGATION                         */}
                                                        {/* ========================================= */}

                                                        <div className="flex items-center gap-2">
                                                            {/* PREVIOUS */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    goToHourScreenshot(
                                                                        hourIndex -
                                                                        1
                                                                    )
                                                                }
                                                                disabled={
                                                                    isFirst
                                                                }
                                                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${isFirst
                                                                    ? "cursor-not-allowed bg-gray-100 text-gray-300"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                                                                    }`}
                                                                aria-label={`Previous screenshot for ${hour}`}
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </button>

                                                            {/* DOT INDICATORS */}

                                                            <div className="hidden max-w-[180px] items-center gap-1 overflow-hidden sm:flex">
                                                                {screenshots
                                                                    .slice(
                                                                        0,
                                                                        12
                                                                    )
                                                                    .map(
                                                                        (
                                                                            _: any,
                                                                            index: number
                                                                        ) => {
                                                                            const isActive =
                                                                                index ===
                                                                                hourIndex;

                                                                            return (
                                                                                <button
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        goToHourScreenshot(
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                    aria-label={`Screenshot ${index +
                                                                                        1
                                                                                        } of ${screenshots.length
                                                                                        } for ${hour}`}
                                                                                    className={`h-1.5 rounded-full transition-all duration-200 ${isActive
                                                                                        ? "w-6 bg-indigo-600"
                                                                                        : "w-1.5 bg-gray-300 hover:bg-gray-400"
                                                                                        }`}
                                                                                />
                                                                            );
                                                                        }
                                                                    )}

                                                                {screenshots.length >
                                                                    12 && (
                                                                        <span className="ml-1 text-[10px] text-gray-400">
                                                                            +
                                                                            {screenshots.length -
                                                                                12}
                                                                        </span>
                                                                    )}
                                                            </div>

                                                            {/* MOBILE COUNT */}

                                                            <span className="text-[10px] font-medium text-gray-400 sm:hidden">
                                                                {hourIndex +
                                                                    1}
                                                                /
                                                                {
                                                                    screenshots.length
                                                                }
                                                            </span>

                                                            {/* NEXT */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    goToHourScreenshot(
                                                                        hourIndex +
                                                                        1
                                                                    )
                                                                }
                                                                disabled={
                                                                    isLast
                                                                }
                                                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${isLast
                                                                    ? "cursor-not-allowed bg-gray-100 text-gray-300"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                                                                    }`}
                                                                aria-label={`Next screenshot for ${hour}`}
                                                            >
                                                                <ChevronRight className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* ========================================= */}
                                                    {/* HOUR PROGRESS BAR                       */}
                                                    {/* ========================================= */}

                                                    <div className="h-1 w-full bg-gray-100">
                                                        <div
                                                            className="h-full bg-indigo-500 transition-all duration-200"
                                                            style={{
                                                                width:
                                                                    screenshots.length >
                                                                        0
                                                                        ? `${((hourIndex +
                                                                            1) /
                                                                            screenshots.length) *
                                                                        100
                                                                        }%`
                                                                        : "0%",
                                                            }}
                                                        />
                                                    </div>

                                                    {/* ========================================= */}
                                                    {/* SCREENSHOT ROW                          */}
                                                    {/* ========================================= */}

                                                    <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white px-2 pb-3 pt-3 shadow-sm">
                                                        {/*
                                                            IMPORTANT:

                                                            This is the horizontal
                                                            scroll area for THIS
                                                            hour only.

                                                            scrollbar-hide hides
                                                            the native scrollbar.
                                                        */}
                                                        <div
                                                            ref={(
                                                                el
                                                            ) => {
                                                                rowRefs.current[
                                                                    hour
                                                                ] =
                                                                    el;
                                                            }}
                                                            className="flex min-w-0 gap-3 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide"
                                                        >
                                                            {screenshots.map(
                                                                (
                                                                    screenshot: any
                                                                ) => {
                                                                    const screenshotIndex =
                                                                        screenshots.findIndex(
                                                                            (
                                                                                s: any
                                                                            ) =>
                                                                                s._id ===
                                                                                screenshot._id
                                                                        );

                                                                    const isSelected =
                                                                        screenshotIndex ===
                                                                        hourIndex;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                screenshot._id
                                                                            }
                                                                            className="w-[260px] flex-none"
                                                                        >
                                                                            <div className="relative">
                                                                                <div
                                                                                    onClick={() => {
                                                                                        setCurrentHour(
                                                                                            hour
                                                                                        );

                                                                                        setHourIndexes(
                                                                                            (
                                                                                                prev
                                                                                            ) => ({
                                                                                                ...prev,
                                                                                                [hour]:
                                                                                                    screenshotIndex,
                                                                                            })
                                                                                        );

                                                                                        setSelectedScreenshot(
                                                                                            screenshot
                                                                                        );

                                                                                        /*
                                                                                         * Bring clicked
                                                                                         * screenshot
                                                                                         * into view.
                                                                                         */
                                                                                        rowRefs.current[
                                                                                            hour
                                                                                        ]?.scrollTo(
                                                                                            {
                                                                                                left:
                                                                                                    screenshotIndex *
                                                                                                    275,
                                                                                                behavior:
                                                                                                    "smooth",
                                                                                            }
                                                                                        );
                                                                                    }}
                                                                                    className={`cursor-pointer overflow-hidden rounded-md border shadow-sm transition-all duration-200 ${isSelected
                                                                                        ? "border-indigo-300 shadow-md"
                                                                                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                                                                        }`}
                                                                                >
                                                                                    {/* SCREENSHOT */}

                                                                                    <Image
                                                                                        src={
                                                                                            screenshot.imageUrl
                                                                                        }
                                                                                        alt="Screenshot"
                                                                                        width={
                                                                                            260
                                                                                        }
                                                                                        height={
                                                                                            146
                                                                                        }
                                                                                        className="aspect-video h-auto w-full object-cover"
                                                                                        unoptimized
                                                                                    />

                                                                                    {/* SCREENSHOT INFO */}

                                                                                    <div className="border-t border-gray-100 bg-white p-2.5">
                                                                                        <div className="mb-1 flex items-center justify-between">
                                                                                            {/* TIME */}

                                                                                            <div className="text-xs font-medium text-gray-700">
                                                                                                {new Date(
                                                                                                    screenshot.capturedAt
                                                                                                ).toLocaleTimeString(
                                                                                                    [],
                                                                                                    {
                                                                                                        hour: "2-digit",
                                                                                                        minute: "2-digit",
                                                                                                    }
                                                                                                )}
                                                                                            </div>

                                                                                            {/* ACTIVITY */}

                                                                                            <div
                                                                                                className="flex items-center gap-1 text-xs font-medium"
                                                                                                style={{
                                                                                                    color: getActivityColor(
                                                                                                        screenshot.activityScore ||
                                                                                                        0
                                                                                                    ),
                                                                                                }}
                                                                                            >
                                                                                                <span
                                                                                                    className="h-1.5 w-1.5 rounded-full"
                                                                                                    style={{
                                                                                                        backgroundColor:
                                                                                                            getActivityColor(
                                                                                                                screenshot.activityScore ||
                                                                                                                0
                                                                                                            ),
                                                                                                    }}
                                                                                                />

                                                                                                {screenshot.activityScore ||
                                                                                                    0}
                                                                                                %
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* ACTIVITY BAR */}

                                                                                        <div className="h-1 overflow-hidden rounded-full bg-gray-200">
                                                                                            <div
                                                                                                className="h-full rounded-full"
                                                                                                style={{
                                                                                                    width: `${screenshot.activityScore ||
                                                                                                        0
                                                                                                        }%`,
                                                                                                    backgroundColor:
                                                                                                        getActivityColor(
                                                                                                            screenshot.activityScore ||
                                                                                                            0
                                                                                                        ),
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* ========================================= */}
                                                    {/* PER-HOUR DOT INDICATORS                 */}
                                                    {/* ========================================= */}

                                                    <div className="flex items-center justify-center gap-1 pt-2">
                                                        {screenshots
                                                            .slice(
                                                                0,
                                                                12
                                                            )
                                                            .map(
                                                                (
                                                                    _: any,
                                                                    index: number
                                                                ) => (
                                                                    <button
                                                                        key={
                                                                            index
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            goToHourScreenshot(
                                                                                index
                                                                            )
                                                                        }
                                                                        aria-label={`Go to screenshot ${index +
                                                                            1
                                                                            } for ${hour}`}
                                                                        className={`h-1.5 rounded-full transition-all duration-200 ${index ===
                                                                            hourIndex
                                                                            ? "w-6 bg-indigo-600"
                                                                            : "w-1.5 bg-gray-300 hover:bg-gray-400"
                                                                            }`}
                                                                    />
                                                                )
                                                            )}

                                                        {screenshots.length >
                                                            12 && (
                                                                <span className="ml-1 text-[10px] text-gray-400">
                                                                    +
                                                                    {screenshots.length -
                                                                        12}
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ================================================= */}
                        {/* SCREENSHOT DETAILS MODAL                         */}
                        {/* ================================================= */}

                        {selectedScreenshot && (
                            <ScreenshotDetailsModal
                                screenshot={
                                    activeScreenshot
                                }
                                currentIndex={
                                    currentIndexInHour
                                }
                                total={totalInHour}
                                onPrevious={() =>
                                    goToIndexInHour(
                                        currentIndexInHour -
                                        1
                                    )
                                }
                                onNext={() =>
                                    goToIndexInHour(
                                        currentIndexInHour +
                                        1
                                    )
                                }
                                onClose={() =>
                                    setSelectedScreenshot(
                                        null
                                    )
                                }
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* HIDDEN HORIZONTAL SCROLLBAR                               */}
            {/* ========================================================= */}

            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    );
}