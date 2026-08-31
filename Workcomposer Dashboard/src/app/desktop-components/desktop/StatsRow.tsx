"use client";

import { ChartColumn, TrendingUp, Clock } from "lucide-react";
import { FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import API from "@/api";

export default function StatsRow() {
    const [stats, setStats] = useState({
        todaySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
        avgDaySeconds: 0,
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

    const formatHours = (seconds: number) => {
        return `${(seconds / 3600).toFixed(1)}h`;
    };

    return (
        <div className="relative mt-3 px-3">
            {/* Ambient background */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-green-500/5 blur-3xl" />

            <div className="pointer-events-none absolute right-0 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-purple-500/5 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {/* LAST 7 DAYS */}
                <div className="relative overflow-hidden rounded-lg border border-[#1b2940] bg-[#0e1527] p-5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(22,163,74,0.25)]">

                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-500/10 blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <ChartColumn className="h-3.5 w-3.5 text-green-600" />

                            <p className="text-xs font-semibold text-gray-400">
                                LAST 7 DAYS
                            </p>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-white">
                            {formatHours(stats.weekSeconds)}
                        </h2>
                    </div>
                </div>

                {/* LAST 30 DAYS */}
                <div className="relative overflow-hidden rounded-lg border border-[#1b2940] bg-[#0e1527] p-5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(37,99,235,0.25)]">

                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="h-3.5 w-3.5 text-blue-600" />

                            <p className="text-xs font-semibold text-gray-400">
                                LAST 30 DAYS
                            </p>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-white">
                            {formatHours(stats.monthSeconds)}
                        </h2>
                    </div>
                </div>

                {/* AVG/DAY */}
                <div className="relative overflow-hidden rounded-lg border border-[#1b2940] bg-[#0e1527] p-5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(22,163,74,0.25)]">

                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-500/10 blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-green-600" />

                            <p className="text-xs font-semibold text-gray-400">
                                AVG/DAY
                            </p>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-white">
                            {formatHours(stats.avgDaySeconds)}
                        </h2>
                    </div>
                </div>

                {/* TODAY */}
                <div className="relative overflow-hidden rounded-lg border border-[#1b2940] bg-[#0e1527] p-5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]">

                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-purple-500" />

                            <p className="text-xs font-semibold text-gray-400">
                                TODAY
                            </p>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-white">
                            {formatHours(stats.todaySeconds)}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}