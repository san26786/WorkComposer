"use client";
import { ChevronsUpDown } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label:
        i === 0
            ? "12 AM"
            : i < 12
                ? `${i} AM`
                : i === 12
                    ? "12 PM"
                    : `${i - 12} PM`,
}));

const MINUTES = ["00", "15", "30", "45"];

type Props = {
    value: string;
    onChange: (value: string) => void;
    isEndTime?: boolean;
    disabled?: boolean;
};
export default function ShiftTimePicker({
    value,
    onChange,
    isEndTime = false,
    disabled = false,
}: Props) {
    const [hour, minute] = value.split(":");

    return (
        <div className="flex items-center gap-3">

            <div
                className={`relative ${isEndTime ? "w-42" : "w-26"
                    }`}
            >
                <select
                    value={Number(hour)}
                    onChange={(e) =>
                        onChange(
                            `${String(e.target.value).padStart(2, "0")}:${minute}`
                        )
                    }
                    disabled={disabled}
                    className={`h-10 w-full appearance-none rounded-lg border px-3 pr-8 text-sm outline-none transition ${disabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white focus:border-indigo-500"
                        }`}
                >
                    {HOURS.map((h) => (
                        <option key={h.value} value={h.value}>
                            {isEndTime ? `Same day ${h.label}` : h.label}
                        </option>
                    ))}
                </select>

                <ChevronsUpDown
                    size={16}
                    className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${disabled ? "text-gray-400" : "text-gray-500"
                        }`}
                />
            </div>
            <span className="text-lg font-semibold text-gray-500">
                :
            </span>

            <div className="relative w-26">
                <select
                    value={minute}
                    onChange={(e) =>
                        onChange(
                            `${hour}:${e.target.value}`
                        )
                    }
                    disabled={disabled}
                    className={`h-10 w-full appearance-none rounded-lg border px-3 pr-8 text-sm outline-none transition ${disabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white focus:border-indigo-500"
                        }`}
                >
                    {MINUTES.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>

                <ChevronsUpDown
                    size={16}
                    className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${disabled ? "text-gray-400" : "text-gray-500"
                        }`}
                />
            </div>

        </div>
    );
}