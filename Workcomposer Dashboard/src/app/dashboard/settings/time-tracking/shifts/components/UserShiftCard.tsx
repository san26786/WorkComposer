"use client";

import { Settings2 } from "lucide-react";

type Day = {
    day: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
};

type Props = {
    user: any;
    schedule: Day[];
    onConfigure: () => void;
    hasCustomSettings: boolean;
    onReset: () => void;
};

export default function UserShiftCard({
    user,
    schedule,
    onConfigure,
    hasCustomSettings,
    onReset,
}: Props) {
return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-6 hover:bg-gray-50">

        {/* Left */}
        <div className="flex items-center gap-4">

            {user?.avatar ? (
                <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                    {`${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase()}
                </div>
            )}

            <div>
                <h3 className="font-semibold text-blue-700">
                    {user.firstName} {user.lastName}
                </h3>

                {hasCustomSettings && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                        Custom setting
                    </div>
                )}

            </div>

        </div>

        {/* Center */}
        <div className="flex flex-1 items-center justify-center gap-6">

            <div className="w-full max-w-[450px] rounded-xl border border-gray-300 bg-white p-2 shadow-md">

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">

                    <h3 className="text-sm font-semibold text-gray-900">
                        Weekly Schedule
                    </h3>

                    <button
                        onClick={onConfigure}
                        className="flex gap-2 rounded-md border border-indigo-300 bg-indigo-100 px-5 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                    >
                        <Settings2 size={16} />
                        Configure Shifts
                    </button>

                </div>

                {/* Schedule */}
                <div className="flex gap-2">

                    {schedule.map((day) => (
                        <div
                            key={day.day}
                            className={`flex h-10 w-22 flex-col items-center justify-center rounded-sm border ${day.enabled
                                ? "border-emerald-600 bg-emerald-50"
                                : "border-gray-200 bg-gray-50"
                                }`}
                        >
                            <div className="text-[11px] font-semibold uppercase text-gray-700">
                                {day.day.slice(0, 3)}
                            </div>

                            <div
                                className={`mt-1 text-[11px] font-medium ${day.enabled
                                    ? "text-emerald-700"
                                    : "text-gray-500"
                                    }`}
                            >
                                {day.enabled
                                    ? `${day.startTime.slice(0, 2)}-${day.endTime.slice(0, 2)}`
                                    : "Off"}
                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </div>

        {hasCustomSettings && (
            <div className="flex w-[90px] justify-end">
                <button
                    onClick={onReset}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                    Reset
                </button>
            </div>
        )}
    </div>
);
}