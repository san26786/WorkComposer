"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";

type Props = {
    data: {
        time: string;
        value: number;
        color?: string;
    }[];
};

export default function ActivityChart({
    data,
}: Props) {
    return (
        <div className="h-52 sm:h-64 lg:h-full w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    barCategoryGap="0%"
                >

                    <CartesianGrid
                        stroke="#E5E7EB"
                        strokeDasharray="2 2"
                        vertical={false}
                    />

                    <YAxis
                        domain={[0, 100]}
                        ticks={[0, 100]}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => `${value}%`}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                    />

                    <XAxis
                        dataKey="time"
                        interval="preserveStartEnd"
                        minTickGap={20}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        formatter={(value) => [`${value}%`, "Activity"]}
                        wrapperStyle={{
                            zIndex: 100,
                        }}
                        contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: 11,
                        }}
                    />

                    <Bar
                        dataKey="value"
                        maxBarSize={6}
                        radius={[2, 2, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={entry.color ?? "#3B82F6"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}