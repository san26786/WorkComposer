"use client";

import { useState } from "react";
import ReportsSidebar from "./ReportsSidebar";
import OverviewHeader from "@/app/dashboard/time-tracking/overview/OverviewHeader";
import API from "@/api";
import { useEffect } from "react";
// import AttendanceModule from "@/app/modules/attendance/AttendanceModule";
import AttendanceContent from "./content/AttendanceContent";
import TeamReportContent from "./content/OverviewContentModule";
import ProductivityContent from "./content/ProductivityContent";
import ScreenshotsContent from "@/app/modules/reports/content/ScreenshotsContent";
import UsageContent from "./content/UsageContent";
import OverviewContentModule from "./content/OverviewContentModule";
import ProjectTrackingContent from "./content/ProjectTrackingContent";
import LocationContent from "./content/LocationContent";
import { useDesktop } from "@/context/DesktopContext";
import TimeTrackingContext from "@/context/TimeTrackingContext";
import { getAppTimezone } from "@/utils/appTimezone";
import { useDashboard } from "@/context/DashboardContext";



export default function ReportsModule() {

    const {
        activeReport,
        setActiveReport,
    } = useDesktop();

    const { user } = useDashboard();

    const timezone = getAppTimezone(
        user?.reportTimezone
    );

    const [date, setDate] = useState(new Date());

    const [selectedTeams, setSelectedTeams] = useState<any[]>([]);

    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const [sortBy, setSortBy] = useState("name");

    const [order, setOrder] = useState("asc");

    const [users, setUsers] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        setRefreshKey((prev) => prev + 1);

        // Give all report components time to refetch.
        setTimeout(() => {
            setIsRefreshing(false);
        }, 800);
    };

    const [reportRange, setReportRange] = useState({
        type: "Day",
        startDate: new Date(),
        endDate: new Date(),
    });

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

    const teams = Array.from(
        new Map(
            users
                .filter((user: any) => user.team)
                .map((user: any) => [user.team._id, user.team])
        ).values()
    );

    const reportComponents = {
        overview: (
            <OverviewContentModule
                reportRange={reportRange}
                selectedTeams={selectedTeams}
                selectedUsers={selectedUsers}
                sortBy={sortBy}
                order={order}
                refreshKey={refreshKey}
                isRefreshing={isRefreshing}
            />
        ),

        attendance: (
            <AttendanceContent
                reportRange={reportRange}
                selectedTeams={selectedTeams}
                selectedUsers={selectedUsers}
                sortBy={sortBy}
                order={order}
            />
        ),

        screenshots: (
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
        ),

        usage: (
            <UsageContent
                reportRange={reportRange}
                selectedTeams={selectedTeams}
                selectedUsers={selectedUsers}
                sortBy={sortBy}
                order={order}
                refreshKey={refreshKey}
                isRefreshing={isRefreshing}
                timezone={timezone}
            />
        ),

        productivity: (
            <ProductivityContent
                reportRange={reportRange}
                selectedTeams={selectedTeams}
                selectedUsers={selectedUsers}
                sortBy={sortBy}
                order={order}
                refreshKey={refreshKey}
                isRefreshing={isRefreshing}
                timezone={timezone}
            />
        ),

        "project-tracking": (
            <ProjectTrackingContent
                reportRange={reportRange}
                selectedTeams={selectedTeams}
                selectedUsers={selectedUsers}
                sortBy={sortBy}
                order={order}
                refreshKey={refreshKey}
                isRefreshing={isRefreshing}
                timezone={timezone}
            />
        ),

        location: (
            <LocationContent
                reportRange={reportRange}
                selectedTeams={selectedTeams}
                selectedUsers={selectedUsers}
                sortBy={sortBy}
                order={order}
            />
        ),
    };

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
            <div className="flex h-full">

                <div className="flex-1 flex flex-col">
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

                    <div className="flex-1 overflow-auto">

                        {reportComponents[
                            activeReport as keyof typeof reportComponents
                        ]}

                    </div>

                </div>

            </div>
        </TimeTrackingContext.Provider>
    );
}