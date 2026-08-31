"use client";
import { useEffect } from "react";
import Footer from "@/app/dashboard/time-tracking/overview/Footer";
import OverviewContentModule from "@/app/modules/reports/content/OverviewContentModule";
import { useTimeTracking } from "@/context/TimeTrackingContext";

export default function Page() {

  const {
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
  } = useTimeTracking();

  return (
    <>
      <OverviewContentModule
        reportRange={reportRange}
        selectedTeams={selectedTeams}
        selectedUsers={selectedUsers}
        sortBy={sortBy}
        order={order}
        refreshKey={refreshKey}
        isRefreshing={isRefreshing}
      />
    </>
  );
}