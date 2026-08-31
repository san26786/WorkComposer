"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import UsageContent from "@/app/modules/reports/content/UsageContent";

const AppsUsage = () => {

  const {
    date,
    setDate,
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
  )
}

export default AppsUsage;
