"use client";

import { useEffect, useState } from "react";
import ShiftTimePicker from "./ShiftTimePicker";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    onClose: () => void;

    initialStartTime?: string;
    initialEndTime?: string;

    onSave: (startTime: string, endTime: string) => void;
};
export default function ScheduleBreakModal({
    open,
    onClose,
    onSave,
    initialStartTime,
    initialEndTime,
}: Props) {
    const [startTime, setStartTime] = useState(
        initialStartTime ?? "12:00"
    );

    const [endTime, setEndTime] = useState(
        initialEndTime ?? "13:00"
    );

    useEffect(() => {
        if (!open) return;

        setStartTime(initialStartTime ?? "12:00");
        setEndTime(initialEndTime ?? "13:00");
    }, [open, initialStartTime, initialEndTime]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            >
                {/* Header */}
                <div className="border-b border-gray-200 px-8 py-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Schedule Break
                    </h2>
                </div>

                {/* Body */}
                <div className="space-y-6 px-8 py-6">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            From
                        </label>

                        <ShiftTimePicker
                            value={startTime}
                            onChange={setStartTime}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            To
                        </label>

                        <ShiftTimePicker
                            value={endTime}
                            onChange={setEndTime}
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 px-8 py-5">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            if (endTime <= startTime) {
                                toast.error("Break end time must be after start time.");
                                return;
                            }

                            onSave(startTime, endTime);
                            onClose();
                        }}
                        className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}