"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import AttendanceCard from "@/app/dashboard/time-tracking/attendance/AttendanceCard";
import type { ReportContentProps } from "../types";
import { formatLocalDate } from "@/utils/date";


export default function AttendanceContent({
    reportRange,
    selectedTeams,
    selectedUsers,
    sortBy,
    order,
}: ReportContentProps) {

    const [users, setUsers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

const fetchAllUsers = async () => {
    try {
        const res = await API.get("/users/all-users", {
            params: {
                page: 1,
                limit: 1000,
            },
        });

        setAllUsers(
            Array.isArray(res.data.users)
                ? res.data.users
                : []
        );
    } catch (error) {
        console.error("ERROR FETCHING USERS:", error);
        setAllUsers([]);
    }
};

useEffect(() => {
    fetchAllUsers();
}, []);

    useEffect(() => {
    const fetchAttendance = async () => {
        try {
            const formatLocalDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");

                return `${year}-${month}-${day}`;
            };

            const startDate = formatLocalDate(reportRange.startDate);
            const endDate = formatLocalDate(reportRange.endDate);

            const { data } = await API.get("/attendance", {
                params: {
                    startDate,
                    endDate,
                    users: selectedUsers.map((u) => u._id).join(","),
                    teams: selectedTeams.join(","),
                    sortBy,
                    order,
                },
            });


            setUsers(data);
        } catch (error) {
            console.error("ATTENDANCE ERROR:", error);
        }
    };

    fetchAttendance();
}, [
    reportRange,
    selectedUsers,
    selectedTeams,
    sortBy,
    order,
]);

    return (
      <AttendanceCard
    users={users}
    allUsers={allUsers}
    reportRange={reportRange}
    selectedUsers={selectedUsers}
    selectedTeams={selectedTeams}
/>
    );
}