"use client";

import LocationContainer from "./LocationContainer";
import { useTimeTracking } from "@/context/TimeTrackingContext";

export default function Page() {
  const {
    reportRange,
    selectedTeams,
    selectedUsers,
    sortBy,
    order,
    refreshKey,
    isRefreshing,
  } = useTimeTracking();

  return (
    <div className="h-full">
      <LocationContainer
        reportRange={reportRange}
        selectedTeams={selectedTeams}
        selectedUsers={selectedUsers}
        sortBy={sortBy}
        order={order}
        refreshKey={refreshKey}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}