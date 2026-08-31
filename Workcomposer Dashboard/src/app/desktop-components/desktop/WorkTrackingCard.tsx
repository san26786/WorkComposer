"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import API from "@/api";

export default function WorkTimeTrackingCard() {
    const [stats, setStats] = useState({
        todaySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get("/sessions/stats");
                setStats(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchStats();

        const interval = setInterval(fetchStats, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const totalSeconds = Math.floor(seconds);

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    return (
        <div className="relative h-[220px] overflow-hidden rounded-xl bg-[#17253D] p-5 transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]">

            {/* ========================= */}
            {/* BACKGROUND EFFECT */}
            {/* ========================= */}

            {/* Top-right blue glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />

            {/* Bottom-left indigo glow */}
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />

            {/* Moving clock glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/5 blur-2xl time-float" />

            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.035] time-grid" />

            {/* ========================= */}
            {/* CONTENT */}
            {/* ========================= */}

            <div className="relative z-10">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                        <Clock className="h-4 w-4 text-white" />
                    </div>

                    <h3 className="mb-4 text-xs font-semibold text-gray-400">
                        WORK TIME TRACKING
                    </h3>
                </div>

                {/* Today / Week */}
                <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-white/[0.03] bg-[#101B2D]/90 p-3 backdrop-blur-sm">
                        <p className="text-xs text-gray-400">
                            TODAY
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white">
                            {formatTime(stats.todaySeconds)}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-white/[0.03] bg-[#101B2D]/90 p-3 backdrop-blur-sm">
                        <p className="text-xs text-gray-400">
                            THIS WEEK
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-blue-400">
                            {formatTime(stats.weekSeconds)}
                        </h2>
                    </div>
                </div>

                {/* Month */}
                <div className="mt-4 flex justify-between rounded-lg border border-white/[0.03] bg-[#263452]/90 p-3 text-xs font-semibold backdrop-blur-sm">
                    <span className="text-gray-300">
                        This Month
                    </span>

                    <span className="font-bold text-white">
                        {formatTime(stats.monthSeconds)}
                    </span>
                </div>
            </div>

            {/* ========================= */}
            {/* ANIMATION */}
            {/* ========================= */}

            <style jsx>{`
                .time-float {
                    animation: timeFloat 6s ease-in-out infinite;
                }

                .time-grid {
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

                @keyframes timeFloat {
                    0%,
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                    }

                    50% {
                        transform: translate(-42%, -58%) scale(1.15);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .time-float {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}