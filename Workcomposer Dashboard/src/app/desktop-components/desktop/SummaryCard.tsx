"use client";

import { useEffect, useState } from "react";

import { LuCoffee } from "react-icons/lu";
import { Clock } from "lucide-react";
import { FiActivity } from "react-icons/fi";

import API from "@/api";

export default function TodaySummaryCard() {
    const [summary, setSummary] = useState({
        assignedTasks: 0,
        workedTasks: 0,
        taskWorkSeconds: 0,
        breakSeconds: 0,
        activityPercent: 0,
    });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const { data } = await API.get(
                    "/sessions/today-task-summary"
                );

                setSummary(data);
            } catch (err) {
                console.error("TODAY SUMMARY ERROR:", err);
            }
        };

        fetchSummary();

        const interval = setInterval(fetchSummary, 30000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        if (seconds < 60) {
            return `${seconds}s`;
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(
            (seconds % 3600) / 60
        );

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    };

    return (
        <div className="relative overflow-hidden rounded-xl">

            {/* ========================= */}
            {/* BACKGROUND EFFECT */}
            {/* ========================= */}

            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />

            <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-yellow-500/10 blur-3xl" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-2xl today-summary-float" />

            <div className="pointer-events-none absolute inset-0 opacity-[0.035] today-summary-grid" />

            {/* ========================= */}
            {/* CONTENT */}
            {/* ========================= */}

            <div className="relative z-10 p-1">

                {/* Heading */}
                <h2 className="mb-3 px-1 text-sm font-semibold text-white">
                    TODAY&apos;S SUMMARY
                </h2>

                {/* ========================= */}
                {/* TASKS + BREAKS */}
                {/* ========================= */}

                <div className="grid grid-cols-2 gap-3">

                    {/* TASKS */}
                    <div className="rounded-xl border border-[#22324D] bg-[#101B2D]/95 p-3 transition-shadow duration-300 hover:shadow-[0_0_18px_rgba(34,197,94,0.25)]">

                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-green-500" />

                            <p className="text-xs text-gray-400">
                                TASKS
                            </p>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-white">
                            {summary.workedTasks}
                        </h2>

                        <p className="mt-1 text-[10px] text-gray-500">
                            {summary.assignedTasks} assigned
                        </p>
                    </div>

                    {/* BREAKS */}
                    <div className="rounded-lg border border-[#22324D] bg-[#101B2D]/95 p-3 transition-shadow duration-300 hover:shadow-[0_0_18px_rgba(234,179,8,0.25)]">

                        <div className="flex items-center gap-1">
                            <LuCoffee className="h-3 w-3 text-yellow-500" />

                            <p className="text-xs text-gray-400">
                                BREAKS
                            </p>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-white">
                            {formatTime(summary.breakSeconds)}
                        </h2>
                    </div>
                </div>

                {/* ========================= */}
                {/* ACTIVITY */}
                {/* ========================= */}

                <div className="mt-4 flex items-center justify-between rounded-lg border border-[#574131] bg-[#3A2B22]/95 p-3 text-xs transition-shadow duration-300 hover:shadow-[0_0_18px_rgba(234,179,8,0.25)]">

                    <div className="flex min-w-0 items-center gap-2">
                        <FiActivity className="h-3.5 w-3.5 shrink-0 text-yellow-500" />

                        <span className="truncate text-gray-300">
                            Activity Level
                        </span>
                    </div>

                    <span className="ml-2 shrink-0 text-xs font-bold text-white">
                        {summary.activityPercent}%
                    </span>
                </div>

                {/* ========================= */}
                {/* TASK WORK TIME */}
                {/* ========================= */}

                <div className="mt-2 px-1 text-[10px] text-gray-500">
                    Task work time:{" "}

                    <span className="text-gray-300">
                        {formatTime(summary.taskWorkSeconds)}
                    </span>
                </div>
            </div>

            {/* ========================= */}
            {/* ANIMATION */}
            {/* ========================= */}

            <style jsx>{`
                .today-summary-float {
                    animation: todaySummaryFloat 6s ease-in-out infinite;
                }

                .today-summary-grid {
                    background-image:
                        linear-gradient(
                            rgba(255, 255, 255, 0.5) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(255, 255, 255, 0.5) 1px,
                            transparent 1px
                        );
                    background-size: 24px 24px;
                }

                @keyframes todaySummaryFloat {
                    0%,
                    100% {
                        transform: translate(
                            -50%,
                            -50%
                        ) scale(1);
                    }

                    50% {
                        transform: translate(
                            -42%,
                            -58%
                        ) scale(1.15);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .today-summary-float {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}