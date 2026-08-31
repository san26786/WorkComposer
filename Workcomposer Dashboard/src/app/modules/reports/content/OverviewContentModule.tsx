"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import socket from "@/socket/socket";

import OverviewContent from "@/app/dashboard/time-tracking/overview/OverviewContent";
import EditTime from "@/app/dashboard/time-tracking/overview/EditTime";
import RemoveTime from "@/app/dashboard/time-tracking/overview/RemoveTime";
import { formatDateForApi } from "@/utils/appTimezone";
import { useTimeTracking } from "@/context/TimeTrackingContext";

import type { ReportContentProps } from "../types";

export default function OverviewContentModule({
    reportRange,
    selectedTeams,
    selectedUsers,
    sortBy,
    order,
    refreshKey,
    isRefreshing,
}: ReportContentProps & {
    refreshKey: number;
    isRefreshing: boolean;
}) {

    const { timezone } = useTimeTracking();

    const [data, setData] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const [showModal, setShowModal] = useState(false);

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [isOverviewLoading, setIsOverviewLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    const formattedDate = formatDateForApi(
        reportRange.startDate,
        timezone
    );

    const startDate = formatDateForApi(
        reportRange.startDate,
        timezone
    );

    const endDate = formatDateForApi(
        reportRange.endDate,
        timezone
    );

    const fetchAllUsers = async () => {
        try {
            const { data } = await API.get("/users/all-users", {
                params: {
                    page: 1,
                    limit: 1000,
                },
            });

            const users = Array.isArray(data?.users)
                ? data.users
                : Array.isArray(data)
                    ? data
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

    const fetchOverview = async () => {
        setIsOverviewLoading(true);

        try {
            const res = await API.get(
                `/sessions/overview?startDate=${startDate}&endDate=${endDate}`
            );

            let overviewData = Array.isArray(res.data)
                ? res.data
                : [];

            // TEAM FILTER
            if (selectedTeams.length > 0) {
                const selectedTeamIds = selectedTeams.map((team: any) =>
                    String(typeof team === "object" ? team._id : team)
                );

                overviewData = overviewData.filter((item: any) => {
                    const itemTeamId =
                        typeof item.team === "object"
                            ? item.team?._id
                            : item.team;

                    return selectedTeamIds.includes(String(itemTeamId));
                });
            }

            // USER FILTER
            if (selectedUsers.length > 0) {
                overviewData = overviewData.filter((item: any) =>
                    selectedUsers.some(
                        (user: any) =>
                            String(user._id) === String(item.id)
                    )
                );
            }

            // SORT
            overviewData.sort((a: any, b: any) => {
                let valueA: any;
                let valueB: any;

                switch (sortBy) {
                    case "team":
                        valueA =
                            typeof a.team === "object"
                                ? a.team?.name
                                : a.team;

                        valueB =
                            typeof b.team === "object"
                                ? b.team?.name
                                : b.team;
                        break;

                    case "trackingStatus":
                        valueA = a.status || "";
                        valueB = b.status || "";
                        break;

                    case "externalId":
                        valueA = a.externalId || "";
                        valueB = b.externalId || "";
                        break;

                    case "name":
                    default:
                        valueA = a.name || "";
                        valueB = b.name || "";
                        break;
                }

                valueA = String(valueA).toLowerCase();
                valueB = String(valueB).toLowerCase();

                const comparison = valueA.localeCompare(valueB);

                return order === "desc"
                    ? -comparison
                    : comparison;
            });

            const formattedData = overviewData.map(
                (item: any) => ({
                    id: item.id,
                    name: item.name,
                    avatar: item.avatar,
                    team: item.team,
                    date: formattedDate,
                    workTime: item.workTime,
                    breakTime: item.breakTime,
                    status: item.status,
                    lastSync: item.lastSync,
                    externalId: item.externalId,
                })
            );

            setData(formattedData);

        } catch (err) {
            console.error("FAILED TO FETCH OVERVIEW:", err);
            setData([]);
        } finally {
            setIsOverviewLoading(false);
        }
    };
    useEffect(() => {
        fetchOverview();
    }, [
        formattedDate,
        startDate,
        endDate,
        refresh,
        refreshKey,
        selectedTeams,
        selectedUsers,
        sortBy,
        order,
        timezone,
    ]);

    useEffect(() => {
        socket.on("connect", () => {
            console.info("Frontend connected:", socket.id);
        });

        return () => {
            socket.off("connect");
        };
    }, []);

    return (
        <>
            {isRefreshing ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <div className="flex flex-col items-center justify-center">
                        {/* Spinner */}
                        <div className="relative h-12 w-12">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400" />

                            <div className="absolute inset-2 rounded-full bg-white" />

                            <div className="absolute inset-[14px] rounded-full bg-indigo-600 animate-pulse" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-700">
                            Fetching content...
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Please wait while we update the overview
                        </p>
                    </div>
                </div>
            ) : (

                <OverviewContent
                    data={data}
                    loading={isOverviewLoading}
                    allUsers={allUsers}
                    reportRange={reportRange}
                    onAddManualTime={() => setShowModal(true)}
                    onRemoveTime={() => setShowRemoveModal(true)}
                />
            )}

            {showModal && (
                <EditTime
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        setRefresh((prev) => prev + 1);
                    }}
                />
            )}

            {showRemoveModal && (
                <RemoveTime
                    onClose={() => setShowRemoveModal(false)}
                    onDelete={() => {
                        setShowRemoveModal(false);
                        setRefresh((prev) => prev + 1);
                    }}
                />
            )}
        </>
    );
}