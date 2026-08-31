"use client";

import LocationContainer from "@/app/dashboard/time-tracking/location/LocationContainer";
import type { ReportContentProps } from "../types";

export default function LocationContent({
    reportRange,
    selectedTeams,
    selectedUsers,
    sortBy,
    order,
}: ReportContentProps) {
    return (
        <LocationContainer
            reportRange={reportRange}
            selectedTeams={selectedTeams}
            selectedUsers={selectedUsers}
            sortBy={sortBy}
            order={order}
        />
    );
}