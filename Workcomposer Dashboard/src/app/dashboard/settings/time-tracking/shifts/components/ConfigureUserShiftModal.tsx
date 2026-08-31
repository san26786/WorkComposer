"use client";

import { useEffect, useState } from "react";
import ShiftScheduleEditor from "./ShiftScheduleEditor";
import API from "@/api";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    user: any;
    organizationSchedule: any[];
};

export default function ConfigureUserShiftModal({
    open,
    onClose,
    onSaved,
    user,
    organizationSchedule,
}: Props) {

    const [schedule, setSchedule] = useState<any[]>([]);

    const saveShiftSettings = async (
        updatedSchedule: any[],
        showToast = true
    ) => {
        try {
            await API.patch(`/users/${user._id}/shift-settings`, {
                schedule: updatedSchedule,
            });

            onSaved();

            if (showToast) {
                toast.success("User shift settings updated.");
            }
        } catch (error: any) {
            console.error("USER SHIFT SETTINGS UPDATE ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update user shift settings."
            );
        }
    };

    useEffect(() => {
        if (!user) return;

        if (Array.isArray(user.shiftSettings?.schedule)) {
            const mergedSchedule = structuredClone(organizationSchedule);

            user.shiftSettings.schedule.forEach((userDay: any) => {
                const index = mergedSchedule.findIndex(
                    (day: any) => day.day === userDay.day
                );

                if (index !== -1) {
                    mergedSchedule[index] = userDay;
                }
            });

            setSchedule(mergedSchedule);

            if (user.shiftSettings.schedule.length !== organizationSchedule.length) {
                saveShiftSettings(mergedSchedule, false);
            }
        } else {
            setSchedule(structuredClone(organizationSchedule));
        }
    }, [user, organizationSchedule]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="flex h-[92vh] w-[1160px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-start justify-between border-b bg-slate-50 px-8 py-6">

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Configure Shift Settings
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Configure individual shift settings for{" "}
                            <span className="font-medium text-gray-700">
                                {user?.firstName} {user?.lastName}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2">

                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-9 w-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                                {`${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase()}
                            </div>
                        )}

                        <span className="font-medium text-indigo-700">
                            {user?.firstName} {user?.lastName}
                        </span>

                    </div>

                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">

                    <div className="px-8 pt-8">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Weekly Schedule Configuration
                        </h3>
                    </div>

                    <div className="px-8 py-6">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <ShiftScheduleEditor
                                schedule={schedule}
                                onChange={async (updatedSchedule) => {
                                    setSchedule(updatedSchedule);
                                    await saveShiftSettings(updatedSchedule);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end border-t bg-gray-50 px-8 py-5">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}