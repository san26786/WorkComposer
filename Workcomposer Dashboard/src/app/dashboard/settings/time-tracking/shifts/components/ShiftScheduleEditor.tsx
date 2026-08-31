"use client";

import { useState } from "react";
import ShiftTimePicker from "./ShiftTimePicker";
import ToggleRow from "../../tracking/components/ToggleRow";
import ScheduleBreakModal from "./ScheduleBreakModal";

type Props = {
    schedule: any[];
    onChange: (schedule: any[]) => void;
    disabled?: boolean;
};
export default function ShiftScheduleEditor({
    schedule,
    onChange,
    disabled = false,
}: Props) {
    const [breakModalOpen, setBreakModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [editingBreakIndex, setEditingBreakIndex] = useState<number | null>(null);
    const [editingBreak, setEditingBreak] = useState<any>(null);

    return (
        <>
            <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-8 py-3">
                <div className="col-span-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Day
                    </p>
                </div>

                <div className="col-span-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Start Time
                    </p>
                </div>

                <div className="col-span-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        End Time
                    </p>
                </div>
            </div>

            {schedule.map((day: any, index: number) => (
                <div
                    key={index}
                    className="border-b border-gray-100 px-8 py-6 last:border-b-0"
                >
                    <div className="grid grid-cols-12 items-center gap-4">

                        {/* Day */}
                        <div className="col-span-3 flex items-center gap-3">
                            <ToggleRow
                                checked={day.enabled}
                                onChange={(checked) => {
                                    const updatedSchedule = [...schedule];

                                    updatedSchedule[index] = {
                                        ...updatedSchedule[index],
                                        enabled: checked,
                                    };

                                    onChange(updatedSchedule);
                                }}
                            />

                            <span className="font-medium text-gray-900">
                                {day.day}
                            </span>
                        </div>

                        {/* Start Time */}
                        <div className="col-span-4">
                            <ShiftTimePicker
                                value={day.startTime}
                                disabled={!day.enabled}
                                onChange={(value) => {
                                    const updatedSchedule = [...schedule];

                                    updatedSchedule[index] = {
                                        ...updatedSchedule[index],
                                        startTime: value,
                                    };

                                    onChange(updatedSchedule);
                                }}
                            />
                        </div>

                        {/* End Time */}
                        <div className="col-span-5">
                            <ShiftTimePicker
                                value={day.endTime}
                                isEndTime
                                disabled={!day.enabled}
                                onChange={(value) => {
                                    const updatedSchedule = [...schedule];

                                    updatedSchedule[index] = {
                                        ...updatedSchedule[index],
                                        endTime: value,
                                    };

                                    onChange(updatedSchedule);
                                }}
                            />
                        </div>

                    </div>

                    <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/40 p-5">

                        <div className="col-span-3"></div>
                        <div className="mb-3 flex items-center justify-between">

                            <div>
                                <h4 className="text-xs font-semibold text-gray-900">
                                    Break Times
                                </h4>

                                <p className="mt-2 text-sm font-semibold text-gray-500">
                                    Scheduled breaks:
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={!day.enabled}
                                onClick={() => {
                                    if (!day.enabled) return;

                                    setSelectedDay(index);
                                    setEditingBreak(null);
                                    setEditingBreakIndex(null);
                                    setBreakModalOpen(true);
                                }}
                                className={`text-sm font-medium ${day.enabled
                                    ? "text-indigo-600 hover:text-indigo-700"
                                    : "cursor-not-allowed text-gray-400"
                                    }`}
                            >
                                + Schedule a break
                            </button>



                        </div>

                        {day.breaks?.length > 0 && (
                            <div className="ml-20 mt-3 space-y-2">
                                {day.breaks.map((breakItem: any, breakIndex: number) => (
                                    <div
                                        key={breakIndex}
                                        className="flex items-center justify-between rounded-lg border border-blue-100 bg-white px-4 py-3 shadow-sm"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {breakItem.startTime} - {breakItem.endTime}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                Scheduled Break
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDay(index);
                                                    setEditingBreakIndex(breakIndex);
                                                    setEditingBreak(breakItem);
                                                    setBreakModalOpen(true);
                                                }}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedSchedule = [...schedule];

                                                    updatedSchedule[index] = {
                                                        ...updatedSchedule[index],
                                                        breaks: updatedSchedule[index].breaks.filter(
                                                            (_: any, i: number) => i !== breakIndex
                                                        ),
                                                    };

                                                    onChange(updatedSchedule);
                                                }}
                                                className="text-sm font-medium text-red-600 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>


                </div>
            ))}

            <ScheduleBreakModal
                open={breakModalOpen}
                onClose={() => {
                    setBreakModalOpen(false);
                    setSelectedDay(null);
                    setEditingBreak(null);
                    setEditingBreakIndex(null);
                }}
                initialStartTime={editingBreak?.startTime}
                initialEndTime={editingBreak?.endTime}
                onSave={(startTime, endTime) => {
                    if (selectedDay === null) return;

                    const updatedSchedule = [...schedule];

                    if (editingBreakIndex !== null) {
                        updatedSchedule[selectedDay].breaks[editingBreakIndex] = {
                            ...updatedSchedule[selectedDay].breaks[editingBreakIndex],
                            startTime,
                            endTime,
                        };
                    } else {
                        updatedSchedule[selectedDay] = {
                            ...updatedSchedule[selectedDay],
                            breaks: [
                                ...(updatedSchedule[selectedDay].breaks || []),
                                {
                                    name: "",
                                    startTime,
                                    endTime,
                                },
                            ],
                        };
                    }

                    onChange(updatedSchedule);

                    setEditingBreak(null);
                    setEditingBreakIndex(null);
                }}
            />
        </>
    );
}