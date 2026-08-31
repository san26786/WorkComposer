"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import Footer from "../overview/Footer";
import ScreenshotsContent from "@/app/modules/reports/content/ScreenshotsContent";



export default function Page() {

    const {
        reportRange,
        setReportRange,

        selectedTeams,
        setSelectedTeams,

        selectedUsers,
        setSelectedUsers,

        sortBy,
        setSortBy,

        order,
        setOrder,

        date,
        setDate,

        refreshKey,
        isRefreshing,
        timezone,
    } = useTimeTracking();

    const [users, setUsers] = useState<any[]>([]);

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


    return (
        <>
            <ScreenshotsContent
                reportRange={reportRange}
                selectedTeams={selectedTeams}
                selectedUsers={selectedUsers}
                sortBy={sortBy}
                order={order}
                refreshKey={refreshKey}
                isRefreshing={isRefreshing}
                timezone={timezone}
            />
        </>
    );
}