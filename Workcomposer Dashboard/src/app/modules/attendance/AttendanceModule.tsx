"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import AttendanceCard from "@/app/dashboard/time-tracking/attendance/AttendanceCard";
import OverviewHeader from "@/app/dashboard/time-tracking/overview/OverviewHeader";

export default function AttendanceModule() {

    const [date, setDate] = useState(new Date());

    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const [sortBy, setSortBy] = useState("name");
    const [order, setOrder] = useState("asc");
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [reportRange, setReportRange] = useState({
        type: "Day",
        startDate: new Date(),
        endDate: new Date(),
    });

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                if (refreshKey > 0) {
                    setIsRefreshing(true);
                }

                const startDate =
                    reportRange.startDate
                        .toISOString()
                        .split("T")[0];

                const endDate =
                    reportRange.endDate
                        .toISOString()
                        .split("T")[0];

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
                console.error(error);
            } finally {
                setIsRefreshing(false);
            }
        };

        fetchAttendance();

    }, [
        reportRange,
        selectedUsers,
        selectedTeams,
        sortBy,
        order,
        refreshKey,
    ]);

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

    const teams = [
        ...new Set(users.map((user: any) => user.team)),
    ];

    const handleRefresh = async () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <>

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

                <AttendanceCard
                    users={users}
                    allUsers={allUsers}
                    reportRange={reportRange}
                    selectedUsers={selectedUsers}
                    selectedTeams={selectedTeams}
                />
            </div>
        </>
    )
}

