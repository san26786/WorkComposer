"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

type Props = {
    data: {
        time: string;
        value: number;
    }[];
};

export default function ActivityChart({
    data,
}: Props) {

    const chartData = [...data];

    const tickInterval =
        chartData.length <= 10
            ? 0
            : Math.ceil(chartData.length / 8);

    return (
        <ResponsiveContainer
            width="100%"
            height={240}
        >
            <BarChart
                data={chartData}
                margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                }}
                barCategoryGap="5%"
                barGap={0}
            >

                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                />

                <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval={tickInterval}
                />

                <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                />

                <Tooltip
                    formatter={(value) => [`${value}%`, "Activity"]}
                    labelFormatter={(label) => `${label}`}
                    cursor={{
                        fill: "transparent",
                    }}
                />

                <Bar
                    dataKey="value"
                    fill="#7C6CF6"
                    radius={[2, 2, 0, 0]}
                    barSize={8}
                />

            </BarChart>
        </ResponsiveContainer>
    );
}