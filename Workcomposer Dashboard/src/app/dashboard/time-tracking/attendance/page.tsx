"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import AttendanceCard from "./AttendanceCard";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { formatDateForApi } from "@/utils/appTimezone";

export default function Page() {
    const {
        reportRange,
        setReportRange,
        selectedTeams,
        selectedUsers,
        sortBy,
        order,
        refreshKey,
        isRefreshing,
        timezone,
    } = useTimeTracking();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
    const fetchAllUsers = async () => {
        try {
            const { data } = await API.get("/users/all-users");
            setAllUsers(data);
        } catch (error) {
            console.error("FAILED TO FETCH USERS:", error);
        }
    };

    fetchAllUsers();
}, []);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);

                const startDate = formatDateForApi(
                    reportRange.startDate,
                    timezone
                );

                const endDate = formatDateForApi(
                    reportRange.endDate,
                    timezone
                );

                // Convert team objects OR string IDs into IDs
                const teamIds = selectedTeams
                    .map((team: any) =>
                        typeof team === "string"
                            ? team
                            : team?._id
                    )
                    .filter(Boolean);

                // Convert selected users into IDs
                const userIds = selectedUsers
                    .map((user: any) =>
                        typeof user === "string"
                            ? user
                            : user?._id
                    )
                    .filter(Boolean);

                const params = {
                    startDate,
                    endDate,
                    users: userIds.join(","),
                    teams: teamIds.join(","),
                    sortBy,
                    order,
                };

                const { data } = await API.get(
                    "/attendance",
                    {
                        params,
                    }
                );

                setUsers(Array.isArray(data) ? data : []);
            } catch (error: any) {
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [
        reportRange.startDate,
        reportRange.endDate,
        reportRange.type,
        selectedUsers,
        selectedTeams,
        sortBy,
        order,
        refreshKey,
        timezone
    ]);

    return (
        <>
            {loading || isRefreshing ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative h-12 w-12">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400" />

                            <div className="absolute inset-2 rounded-full bg-white" />

                            <div className="absolute inset-[14px] animate-pulse rounded-full bg-indigo-600" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-700">
                            Fetching content...
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Please wait while we update the attendance
                        </p>
                    </div>
                </div>
            ) : (
               <AttendanceCard
    users={users}
    allUsers={allUsers}
    reportRange={reportRange}
    selectedUsers={selectedUsers}
    selectedTeams={selectedTeams}
/>
            )}
        </>
    );
}