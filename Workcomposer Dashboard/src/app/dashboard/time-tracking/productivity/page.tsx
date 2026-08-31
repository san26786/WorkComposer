"use client";

import { useState, useEffect } from "react";
import API from "@/api";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import ProductivityContent from "@/app/modules/reports/content/ProductivityContent";

const Page = () => {

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
  ;

  return (
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
  );
};

export default Page;
