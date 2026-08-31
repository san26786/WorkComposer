"use client";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

type Props = {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
};

const AppUsageChart = ({
    data,
}: Props) => {

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
        return `${remainingSeconds}s`;
    };

    return (
        <div className="w-[110px] h-[110px]">
            <ResponsiveContainer
                width="100%" height="100%">
                <PieChart>
                    <Tooltip
                        formatter={(value, _name, item) => [
                            formatDuration(Number(value)),
                            item.payload.name,
                        ]}
                        contentStyle={{
                            fontSize: "11px",
                            padding: "6px 10px",
                            borderRadius: "8px",
                        }}
                        labelStyle={{
                            fontSize: "11px",
                            fontWeight: 600,
                        }}
                        itemStyle={{
                            fontSize: "11px",
                        }}
                    />

                    <Pie
                        data={data}
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {data.map((item, index) => (
                            <Cell
                                key={index}
                                fill={item.color || "#36A2EB"}
                            />
                        ))}
                    </Pie>

                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default AppUsageChart
