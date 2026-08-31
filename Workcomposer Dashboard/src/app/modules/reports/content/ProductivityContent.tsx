"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import type { ReportContentProps } from "../types";
import ProductivityCard from "@/app/dashboard/time-tracking/productivity/ProductivityCard";
import { formatDateForApi } from "@/utils/appTimezone";

export default function ProductivityContent({
    reportRange,
    selectedTeams,
    selectedUsers,
    sortBy,
    order,
    refreshKey,
    isRefreshing,
    timezone,
}: ReportContentProps & {
    refreshKey: number;
    isRefreshing: boolean;
    timezone: string;
}) {

    const [report, setReport] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const [allUsers, setAllUsers] = useState<any[]>([]);

const fetchAllUsers = async () => {
    try {
        const { data } = await API.get("/users/all-users", {
            params: {
                page: 1,
                limit: 1000,
            },
        });

        const users = Array.isArray(data)
            ? data
            : Array.isArray(data?.users)
                ? data.users
                : Array.isArray(data?.data)
                    ? data.data
                    : [];

        setAllUsers(users);
    } catch (err) {
        console.error("FAILED TO FETCH USERS:", err);
        setAllUsers([]);
    }
};

useEffect(() => {
    fetchAllUsers();
}, []);

    const fetchReport = async () => {
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

            const { data } = await API.get("/reports/productivity", {
                params: {
                    startDate,
                    endDate,
                    users: selectedUsers.map((u) => u._id).join(","),
                    teams: selectedTeams
                        .map((team: any) =>
                            typeof team === "object" ? team._id : team
                        )
                        .filter(Boolean)
                        .join(","),
                    sortBy,
                    order,
                },
            });

            setReport(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [
        reportRange,
        selectedUsers,
        selectedTeams,
        sortBy,
        order,
        refreshKey,
        timezone,
    ]);

    const generateProductivityReport = async () => {
        try {
            await API.post("/reports/productivity", {
                startDate: reportRange.startDate,
                endDate: reportRange.endDate,
                selectedUsers: selectedUsers.map((u) => u._id),
                selectedTeams,
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
     <ProductivityCard
    report={report}
    loading={loading}
    allUsers={allUsers}
    onRefresh={fetchReport}
    onGenerateReport={generateProductivityReport}
    setReport={setReport}
/>
    );
}