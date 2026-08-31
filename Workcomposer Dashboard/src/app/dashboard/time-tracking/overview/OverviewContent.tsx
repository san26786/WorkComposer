"use client";

import Image from "next/image";
import { IoIosPause } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { Clock3 } from "lucide-react";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import { useTimer } from "@/context/TimerContext";
import { useState, useRef, useEffect } from "react";
import UserAnalyticsSection from "./components/UserAnalyticsSection";
import DailyActivityTimeline from "./components/DailyActivityTimeline";
import { useDashboard } from "@/context/DashboardContext";
import UserProfileTrigger from "@/components/UserProfileTrigger";


type DataItem = {
  id: string;
  name: string;
  avatar: string;
  team: string;
  date: string;
  workTime: string;
  breakTime: string;
  status: string;
  lastSync: string;
};

type Props = {
  data?: DataItem[];
  loading?: boolean;
  allUsers: any[];

  reportRange: {
    type: string;
    startDate: Date;
    endDate: Date;
  };

  onAddManualTime: () => void;
  onRemoveTime: () => void;
};

export default function OverviewContent({
  data = [],
  loading = false,
  reportRange,
  onAddManualTime,
  onRemoveTime,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});;
  const { isTracking } = useTimer();
  const { user } = useDashboard();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openMenuId) return;

      const currentMenu = menuRefs.current[openMenuId];

      if (
        currentMenu &&
        !currentMenu.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);


  const formatTime = (time: string) => {
    if (!time) return "0h 0m";

    const [hours, minutes] = time.split(":");

    return `${Number(hours)}h ${minutes}m`;
  };

  const showTimeline =
    reportRange.startDate.toDateString() !==
    reportRange.endDate.toDateString();


  return (
    <div className="min-h-[calc(100vh-250)] rounded-b-lg bg-white shadow-sm border border-r border-b border-gray-200">
      <div className="divide-y divide-gray-200 overflow-visible bg-white">

        {/* Header */}
        <div className="px-3 py-2 sm:px-5 bg-white shadow-sm border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-800">Overview</h2>
          </div>
        </div>

        {/* Content */}
        <div className="w-full min-w-0 px-2 py-4 sm:px-4 overflow-visible">

          {/* EMPTY STATE */}
          {loading ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

                <p className="mt-3 text-sm font-medium text-gray-500">
                  Loading tracking data...
                </p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center my-8 py-6 px-4 bg-gray-50 rounded-lg border border-gray-100">
              <Clock3 className="w-10 h-10 mx-auto text-gray-300 mb-2" />

              <h4 className="text-gray-600 font-medium mb-1">
                No tracking data available
              </h4>

              <p className="text-gray-400 text-sm">
                Tracking information will be displayed here once activity is recorded.
              </p>
            </div>
          ) : (
            data.map((item) => {
              return (
                <div
                  key={item.id}
                  className="
    mb-4
    w-full
    min-w-0
    h-auto
    overflow-visible
    rounded-xl
    border border-gray-100
    p-3 sm:p-4 lg:p-6
    hover:bg-gray-50
    hover:shadow-sm
    transition-all duration-200
  "
                >
                  <div className="flex w-full min-w-0 flex-col gap-4 rounded-lg p-2 -m-2 overflow-visible">
                    <div className="grid w-full min-w-0 grid-cols-1 md:grid-cols-12 gap-4 md:gap-2 items-start md:items-center">

                      {/* Avatar + User Info (row together, even on mobile) */}
                      <div className="md:col-span-5 flex items-center gap-3">

                        <div className="flex-shrink-0">
                          <div className="profile-image-container group relative w-12 h-12">
                            <div
                              className={`absolute inset-0 rounded-full p-0.5 ${(String(item.id) === String(user?._id) ? isTracking : item.status?.includes("running"))
                                ? "bg-linear-to-tr from-green-300 to-green-600"
                                : "bg-linear-to-tr from-red-300 to-red-600"
                                } opacity-80`}
                            >
                              <div className="absolute inset-px rounded-full bg-white"></div>
                            </div>

                            <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                              <UserProfileTrigger
                                user={{
                                  _id: item.id,
                                  name: item.name,
                                  avatar: item.avatar,
                                }}
                                className="block h-full w-full rounded-full"
                              >
                                {item.avatar?.trim() ? (
                                  <Image
                                    src={item.avatar}
                                    alt={item.name}
                                    fill
                                    unoptimized
                                    className="cursor-pointer rounded-full object-cover shadow-md transition-all duration-300 group-hover:shadow-lg"
                                  />
                                ) : (
                                  <div className="h-full w-full cursor-pointer rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                    {item.name?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </UserProfileTrigger>

                              <div className="pointer-events-none absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-5 transition-all duration-300" />
                            </div>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="min-w-0 text-left flex-1">
                          <UserProfileTrigger
                            user={{
                              _id: item.id,
                              name: item.name,
                              avatar: item.avatar,
                            }}
                            className="text-left text-blue-700 font-bold text-lg truncate max-w-full md:max-w-xs cursor-pointer hover:text-indigo-600 transition-colors"
                          >
                            {item.name}
                          </UserProfileTrigger>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                            {(() => {
                              const isCurrentUser = String(item.id) === String(user?._id);

                              const isItemTracking = isCurrentUser
                                ? isTracking
                                : item.status?.includes("running");

                              return (
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-md ${isItemTracking
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  {isItemTracking ? "Tracking" : "Not tracking"}
                                </span>
                              );
                            })()}

                            <span className="text-gray-400">•</span>

                            <span className="text-gray-700">
                              <b>Last sync: </b>
                              <span className="text-gray-600">
                                {item.lastSync || "--"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="w-full min-w-0 md:col-span-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-end">

                        {/* Work + Break */}
                        <div className="flex w-full min-w-0 flex-row flex-wrap gap-5 sm:gap-8 lg:gap-16 text-sm md:justify-end">

                          {/* Work */}
                          <div>
                            <div className="flex items-center mb-1">
                              <Clock3 className="w-5 h-5 mr-2 text-indigo-600" />
                              <span className="text-sm font-medium text-gray-700 uppercase">
                                Work Time
                              </span>
                            </div>
                            <div className="text-blue-600 font-bold text-xl ml-7 whitespace-nowrap">
                              {formatTime(item.workTime)}
                            </div>
                          </div>

                          {/* Break */}
                          <div>
                            <div className="flex items-center mb-1">
                              <IoIosPause className="w-5 h-5 mr-2 text-orange-500" />
                              <span className="text-sm font-medium text-gray-700 uppercase">
                                Break Time
                              </span>
                            </div>
                            <div className="text-orange-600 font-bold text-xl ml-7 whitespace-nowrap">
                              {formatTime(item.breakTime)}
                            </div>
                          </div>

                          {/* Edit */}
                          <div
                            className="relative self-start sm:self-center sm:ml-2 lg:ml-4"
                            ref={(el) => {
                              menuRefs.current[item.id] = el;
                            }}
                          >
                            <button
                              title="Edit time"
                              onClick={() => {

                                setOpenMenuId(
                                  openMenuId === item.id ? null : item.id
                                );

                              }}
                              className="flex items-center px-3 py-2 hover:bg-indigo-100 rounded-md"
                            >
                              <FaRegEdit className="w-5 h-5 text-indigo-500 mr-2" />
                              <span className="text-sm font-medium text-indigo-600">
                                Edit time
                              </span>
                            </button>

                            {openMenuId === item.id && (
                              <div className="absolute right-0 mt-2 w-56 max-w-[90vw] rounded-md bg-white shadow-xl z-50 py-2">

                                <div className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase">
                                  Time Options
                                </div>

                                <div
                                  onClick={() => {

                                    setOpenMenuId(null);
                                    onAddManualTime();
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <FiPlusCircle className="text-green-600" />
                                  Add Manual Time
                                </div>

                                {(user?.role === "owner" || user?.role === "admin") && (
                                  <div
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onRemoveTime();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <FiMinusCircle className="text-red-600" />
                                    Remove Time
                                  </div>
                                )}
                              </div>
                            )}


                          </div>
                        </div>
                      </div>



                    </div>

                    <div className="mt-2 w-full min-w-0 h-auto overflow-visible">
                      <UserAnalyticsSection
                        userId={item.id}
                        selectedDate={new Date(reportRange.startDate)}
                        workTime={item.workTime}
                        userName={item.name}
                      />
                    </div>

                    {showTimeline && (
                      <DailyActivityTimeline
                        userId={item.id}
                        reportRange={reportRange}
                      />
                    )}

                  </div>
                </div>
              )
            })
          )}
        </div >
      </div >
    </div >
  );
}