"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Props = {
    value?: DateRange;
    onChange: (range: DateRange | undefined) => void;
};

export default function DateRangePicker({
    value,
    onChange,
}: Props) {

    const pickerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={pickerRef}
            className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-left hover:border-gray-400"
            >
                <div>
                    <p className="text-sm text-gray-500">
                        Date range
                    </p>

                    <p className="font-medium">
                        {value?.from
                            ? `${format(value.from, "yyyy-MM-dd")} → ${value.to
                                ? format(value.to, "yyyy-MM-dd")
                                : "Select"
                            }`
                            : "Select date range"}
                    </p>
                </div>

                <Calendar className="h-5 w-5 text-gray-500" />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                    <DayPicker
                        mode="range"
                        numberOfMonths={2}
                        pagedNavigation
                        selected={value}
                        onSelect={(range) => {
                            onChange(range);

                            if (range?.from && range?.to) {
                                setOpen(false);
                            }
                        }}
                        className="rounded-xl"
                        classNames={{
    months: "flex flex-col md:flex-row gap-8",

    month: "space-y-4",

    month_caption:
        "flex items-center justify-between px-2",

    caption_label:
        "text-base font-semibold",

    nav:
        "flex items-center gap-2",

    button_previous:
        "h-8 w-8 rounded-md border hover:bg-gray-100 transition",

    button_next:
        "h-8 w-8 rounded-md border hover:bg-gray-100 transition",

    month_grid:
        "w-full border-collapse",

    weekdays:
        "flex",

    weekday:
        "w-10 text-center text-xs font-medium text-gray-500",

    week:
        "flex w-full mt-2",

    day:
        "relative h-10 w-10 text-center",

    day_button:
        "h-10 w-10 rounded-full hover:bg-gray-100 transition",

    selected:
        "bg-blue-600 text-white hover:bg-blue-700",

    today:
        "border border-blue-500",

    range_middle:
        "bg-blue-100 text-blue-700 rounded-none",

    range_start:
        "bg-blue-600 text-white rounded-full",

    range_end:
        "bg-blue-600 text-white rounded-full",
}}
                    />
                </div>
            )}
        </div>
    );
}