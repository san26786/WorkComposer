"use client";

import { useDashboard } from "@/context/DashboardContext";
import { getAppTimezone } from "@/utils/appTimezone";

export function useAppTimezone() {
  const { user } = useDashboard();

  return getAppTimezone(user?.reportTimezone);
}