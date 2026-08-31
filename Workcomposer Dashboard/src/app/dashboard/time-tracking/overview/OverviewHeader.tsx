"use client";
import { useState, useRef, useEffect, type Dispatch, type SetStateAction } from "react";

import { HiUsers } from "react-icons/hi2";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiOfficeBuilding } from "react-icons/hi";
import FilterPopover from "./FilterPopover";
import DateControls from "./DateControls";

type Props = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedTeams: any[];
  setSelectedTeams: React.Dispatch<React.SetStateAction<any[]>>;
  teams: any[];
  selectedUsers: any[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<any[]>>;
  users: any[];

  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  order: string;
  setOrder: React.Dispatch<React.SetStateAction<string>>;

  reportRange: {
    type: string;
    startDate: Date;
    endDate: Date;
  };

  setReportRange: Dispatch<SetStateAction<{
    type: string;
    startDate: Date;
    endDate: Date;
  }>
  >;

  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
};

export default function OverviewHeader({
  date,
  setDate,
  selectedTeams,
  setSelectedTeams,
  selectedUsers,
  setSelectedUsers,
  teams,
  users,
  sortBy,
  setSortBy,
  order,
  setOrder,
  reportRange,
  setReportRange,
  onRefresh,
  isRefreshing,
}: Props) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [open, setOpen] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div className="w-full">
      {/* Top Info */}
      <div className="mt-5 sm:mt-7 mb-2 flex flex-col items-start gap-1 text-[11px] sm:text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-end sm:gap-2 px-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="whitespace-nowrap">Report generated: {formatDateTime(currentTime)}</span>
          <span className="hidden sm:inline">•</span>
          <span className="whitespace-nowrap">
            Timezone: Asia/Calcutta (UTC+05:30)
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="relative flex flex-col gap-3 sm:gap-4 border border-gray-200 rounded-t-md bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex w-full items-center gap-2 sm:gap-3 sm:w-auto">
          <div className="relative flex items-center" ref={ref}>
            {/* Main Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
              className="flex w-full sm:w-auto items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 border border-gray-300 rounded-lg bg-white text-sm transition-colors hover:bg-white hover:border-gray-400 min-w-0"
            >
              {selectedTeams.length > 0 ? (
                <HiOfficeBuilding className="w-4 h-4 text-gray-600" />
              ) : (
                <HiUsers className="w-4 h-4 text-gray-600" />
              )}

              <div className="flex min-w-0 flex-1 items-center gap-2 max-w-full sm:max-w-[250px]">
                {selectedTeams.length > 0 ? (
                  <>
                    <span className="font-medium text-gray-900 truncate">
                      {selectedTeams[0]?.name}
                    </span>

                    <span className="text-gray-400 flex-shrink-0">•</span>

                    <span className="text-gray-500 text-sm whitespace-nowrap flex-shrink-0">
                      {selectedTeams.length} selected
                    </span>
                  </>
                ) : (
                  <span className="truncate text-gray-900">
                    All Users & Teams
                  </span>
                )}
              </div>

              <MdKeyboardArrowDown className="w-4 h-4 text-gray-400 ml-1" />
            </button>

            {/* Clear Button */}
            {selectedTeams.length > 0 && (
              <button
                title="Clear"
                onClick={() => setSelectedTeams([])}
                className="text-sm text-gray-500 hover:text-gray-700 ml-3"
              >
                Clear
              </button>
            )}

            {/* Popover */}
            {open && (
              <div
                className="absolute top-full left-0 right-0 sm:right-auto mt-2 z-50 w-[95vw] max-w-sm sm:w-auto sm:max-w-none"
                onClick={(e) => e.stopPropagation()}
              >
                <FilterPopover
                  selectedTeams={selectedTeams}
                  setSelectedTeams={setSelectedTeams}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  setOpen={setOpen}
                  teams={teams}
                  users={users}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  order={order}
                  setOrder={setOrder}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <DateControls
          date={date}
          setDate={setDate}
          setReportRange={setReportRange}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  );
}