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


const CustomTooltip = ({
    active,
    payload,
    label,
}: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-2">
            <p className="text-xs font-semibold text-indigo-900 mb-2">
                {label}
            </p>

            <div className="flex items-center gap-2 text-xs text-indigo-700">
                <div className="flex items-center gap-2">
                    <span
                        className="w-3 h-3 rounded-full"
                        style={{
                            backgroundColor:
                                data.value < 40
                                    ? "#EF4444"
                                    : data.value < 70
                                        ? "#F59E0B"
                                        : "#22C55E",
                        }}
                    />
                    <span>📊 Activity: {data.value}%</span>
                </div>

                <div className="flex items-center">
                    <span>⏱</span>
                    <span>Work time: {data.workTime}min</span>
                </div>
            </div>
        </div>
    );
};

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
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 20,
                    }}
                >

                    <CartesianGrid
                        stroke="#E5E7EB"
                        strokeDasharray="2 2"
                        vertical={false}
                    />

                    <YAxis
                        domain={[0, 100]}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        tick={{
                            fontSize: 12,
                        }}
                        tickFormatter={(value) => `${value}%`}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                    />

                    <XAxis
                        dataKey="time"
                        interval={3}
                        tick={{
                            fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Bar
                        dataKey="value"
                        barSize={12}
                        radius={[3, 3, 0, 0]}
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