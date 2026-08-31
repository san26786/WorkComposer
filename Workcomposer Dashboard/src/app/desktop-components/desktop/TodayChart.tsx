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

export default function TodayChart({
    refreshKey,
    setRefreshing,
}: Props) {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchChart = async () => {
            try {
                const { data } = await API.get(
                    "/sessions/today-chart"
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

    const formatTime = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);

        return `${h}h ${m}m`;
    };

    const maxValue = Math.max(
        ...data.map(
            (d: any) => d.work + d.break
        ),
        1
    );

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg">

            {/* ================================= */}
            {/* AMBIENT BACKGROUND EFFECT */}
            {/* ================================= */}

            <div className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-500/5 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-blue-400/5 blur-3xl" />

            {/* Subtle grid background */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.025] today-chart-grid" />

            {/* ================================= */}
            {/* CHART */}
            {/* ================================= */}

            <div className="relative z-10 h-full w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={data}
                        barCategoryGap="5%"
                        barGap={0}
                    >
                        <CartesianGrid
                            stroke="#24344F"
                            strokeDasharray="0"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="time"
                            interval={1}
                            tick={{
                                fill: "#7B8794",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            domain={[
                                0,
                                Math.ceil(maxValue),
                            ]}
                            tickFormatter={formatTime}
                            tick={{
                                fill: "#7B8794",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
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
                            fill="#4EA1FF"
                            radius={[
                                0,
                                0,
                                0,
                                0,
                            ]}
                            stackId="total"
                            barSize={11}
                        />

                        {/* Break */}
                        <Bar
                            dataKey="break"
                            fill="#F59E0B"
                            radius={[
                                3,
                                3,
                                0,
                                0,
                            ]}
                            stackId="total"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <style jsx>{`
                .today-chart-grid {
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