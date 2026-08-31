"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid,
} from "recharts";

import CustomTooltip from "./CustomTooltip";

import { useEffect, useState } from "react";
import API from "@/api";

type Props = {
    refreshKey: number;
    setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Last30DaysChart({
    refreshKey,
    setRefreshing,
}: Props) {
    type ChartData = {
        day: string;
        work: number;
        break: number;
    };

    const [data, setData] = useState<ChartData[]>([]);

    useEffect(() => {
        const fetchChart = async () => {
            try {
                const { data } = await API.get(
                    "/sessions/last-30-days-chart"
                );

                setData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setRefreshing(false);
            }
        };

        fetchChart();
    }, [refreshKey, setRefreshing]);

    const formatYAxis = (value: number) => {
        const h = Math.floor(value);
        const m = Math.round((value - h) * 60);

        return `${h}h ${m}m`;
    };

    const maxHours = Math.max(
        ...data.map((d) => d.work + d.break),
        1
    );

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg">

            {/* ================================= */}
            {/* AMBIENT BACKGROUND */}
            {/* ================================= */}

            {/* Blue work-time glow */}
            <div className="pointer-events-none absolute -left-12 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Amber break-time glow */}
            <div className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-amber-500/7 blur-3xl" />

            {/* Bottom subtle blue glow */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-52 -translate-x-1/2 rounded-full bg-blue-400/5 blur-3xl" />

            {/* Subtle background grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.025] last30-chart-grid" />

            {/* ================================= */}
            {/* CHART */}
            {/* ================================= */}

            <div className="relative z-10 h-full w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart data={data}>
                        <CartesianGrid
                            stroke="#24344F"
                            strokeDasharray="0"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="day"
                            interval={2}
                            tick={{
                                fill: "#8B95A7",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            domain={[
                                0,
                                Math.ceil(maxHours),
                            ]}
                            tickFormatter={formatYAxis}
                            tick={{
                                fill: "#8B95A7",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={70}
                        />

                        <Tooltip
                            cursor={{
                                fill: "transparent",
                            }}
                            content={<CustomTooltip />}
                        />

                        {/* Work */}
                        <Bar
                            dataKey="work"
                            stackId="time"
                            fill="#4EA1FF"
                            radius={[0, 0, 0, 0]}
                            barSize={11}
                        />

                        {/* Break */}
                        <Bar
                            dataKey="break"
                            stackId="time"
                            fill="#F59E0B"
                            radius={[3, 3, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <style jsx>{`
                .last30-chart-grid {
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
            `}</style>
        </div>
    );
}