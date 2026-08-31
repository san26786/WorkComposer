"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import TimeTrackingContext from "@/context/TimeTrackingContext";
import OverviewHeader from "./overview/OverviewHeader";
import { useDashboard } from "@/context/DashboardContext";
import {
    getAppTimezone,
    createDateInTimezone,
} from "@/utils/appTimezone";

export default function TimeTrackingLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const { user } = useDashboard();

    const timezone = getAppTimezone(user?.reportTimezone);

    const timezoneParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const currentYear = Number(
        timezoneParts.find((part) => part.type === "year")?.value
    );

    const currentMonth =
        Number(
            timezoneParts.find((part) => part.type === "month")?.value
        ) - 1;

    const currentDay = Number(
        timezoneParts.find((part) => part.type === "day")?.value
    );

    const initialDate = createDateInTimezone(
        currentYear,
        currentMonth,
        currentDay,
        timezone
    );

    const [date, setDate] = useState(initialDate);

    const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    const [sortBy, setSortBy] = useState("name");
    const [order, setOrder] = useState("asc");

    const [reportRange, setReportRange] = useState({
        type: "Day",
        startDate: initialDate,
        endDate: initialDate,
    });
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        setRefreshKey((prev) => prev + 1);

        // Small delay so the refresh animation is visible
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsRefreshing(false);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await API.get("/users");
                setUsers(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();
    }, []);

    const teams = [
        ...new Set(
            users.map((user: any) => user.team)
        ),
    ];

    return (
        <TimeTrackingContext.Provider
            value={{
                timezone,

                date,
                setDate,

                reportRange,
                setReportRange,

                selectedTeams,
                setSelectedTeams,

                selectedUsers,
                setSelectedUsers,

                users,

                sortBy,
                setSortBy,

                order,
                setOrder,

                refreshKey,
                isRefreshing,
                handleRefresh,
            }}
        >
            <div className="px-4 sm:px-6 lg:px-8">

                <OverviewHeader
                    date={date}
                    setDate={setDate}
                    selectedTeams={selectedTeams}
                    setSelectedTeams={setSelectedTeams}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    users={users}
                    teams={teams}
                    reportRange={reportRange}
                    setReportRange={setReportRange}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    order={order}
                    setOrder={setOrder}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />
                {children}

            </div>
        </TimeTrackingContext.Provider>
    );
}