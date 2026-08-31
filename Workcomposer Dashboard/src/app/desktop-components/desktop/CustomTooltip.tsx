interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    return `${h}h ${m}m`;
}

export default function CustomTooltip({
    active,
    payload,
    label,
}: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    const work =
        payload.find((p) => p.dataKey === "work")?.value || 0;

    const breakTime =
        payload.find((p) => p.dataKey === "break")?.value || 0;

    return (
        <div className="bg-[#081224] border border-[#24344F] rounded-xl p-2 shadow-xl min-w-[100px]">

            <h3 className="text-white text-sm font-semibold mb-2">
                {label}
            </h3>

            <div className="space-y-1">

                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 border border-blue-300" />

                    <span className="text-gray-200 text-xs">
                        Work time:
                    </span>

                    <span className="text-white font-semibold text-xs">
                        {formatTime(work)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 border border-yellow-300" />

                    <span className="text-gray-200 text-xs">
                        Break time:
                    </span>

                    <span className="text-white font-semibold text-xs">
                        {formatTime(breakTime)}
                    </span>
                </div>


            </div>
        </div>
    );
}