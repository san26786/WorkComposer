"use client";

import Image from 'next/image';
import {
  Download,
  Camera,
  Clock3,
  Activity,
  ChevronDown,
  X,
} from "lucide-react";
import ScreenshotModal from './ScreenshotModal';
import { useEffect, useState } from 'react';
import API from '@/api';
import ScreenshotDetailsModal from './ScreenshotDetailsModal';

type Props = {
  screenshots: any[];
  selectedUsers: any[];
  sortBy: string;
  order: string;
  startDate: string;
  endDate: string;
};

export default function ScreenshotsCard({
  screenshots,
  selectedUsers,
  sortBy,
  order,
  startDate,
  endDate,
}: Props) {

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedShot, setSelectedShot] = useState<any>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [timelineFrom, setTimelineFrom] = useState("");
  const [timelineTo, setTimelineTo] = useState("");
  const [timelinePreset, setTimelinePreset] = useState("all");


  const [search, setSearch] = useState("");

  const [view, setView] = useState("gallery")

  const [captureFilter, setCaptureFilter] = useState<"captured" | "uncaptured">("captured")

  const groupedScreenshots = screenshots.reduce(
    (acc: any, shot: any) => {
      const email = shot.user?.email || "Unknown User";

      if (!acc[email]) {
        acc[email] = [];
      }

      acc[email].push(shot);

      return acc;
    },
    {}
  );


  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesTeam =
      selectedTeams.length === 0 ||
      selectedTeams.includes(
        user.team || "Default team"
      );

    const matchesSelectedUsers =
      selectedUsers.length === 0 ||
      selectedUsers.some(
        (u) => u.email === user.email
      );

    return matchesSearch && matchesTeam && matchesSelectedUsers;
  });

  const usersWithScreenshots = filteredUsers.map(
    (user: any) => ({
      ...user,
      screenshots: groupedScreenshots[user.email] || [],
    })
  )


  const sortedUsers = [...usersWithScreenshots].sort(
    (a: any, b: any) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      }

      if (sortBy === "team") {
        comparison = (a.team || "").localeCompare(
          b.team || ""
        );
      }

      return order === "asc"
        ? comparison
        : -comparison;
    }
  );

  const finalUsers = sortedUsers.filter(
    (user: any) => {
      if (captureFilter === "captured") {
        return user.screenshots.length > 0;
      }

      return user.screenshots.length === 0;
    }
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");

      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const teams = [
    ...new Set(
      users.map(
        (user: any) =>
          user.team || "Default team"
      )
    ),
  ];

  const handleExport = async () => {
    try {
      const userIds = selectedUsers
        .map((user: any) => user._id)
        .filter(Boolean);

      const response = await API.get(
        "/screenshots/export-zip",
        {
          params: {
            startDate,
            endDate,
            ...(userIds.length > 0
              ? { userIds: userIds.join(",") }
              : {}),
          },
          responseType: "blob",
        }
      );
      const blob = new Blob(
        [response.data],
        { type: "application/zip" }
      );

      if (blob.size === 0) {
        throw new Error(
          "Screenshot export returned an empty ZIP."
        );
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "screenshots.zip";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "SCREENSHOT EXPORT ERROR:",
        err
      );
    }
  };

  const getActivityColor = (score: number) => {
    if (score < 40) return "#EF4444";
    if (score < 70) return "#F59E0B";
    return "#22C55E";
  };

  const getShotTime = (shot: any) => {
    return new Date(shot.capturedAt);
  };

  const timelineFilteredUsers = finalUsers.map((user: any) => {
    const filteredShots = user.screenshots.filter((shot: any) => {
      if (!timelineFrom && !timelineTo) {
        return true;
      }

      const date = getShotTime(shot);

      const minutes =
        date.getHours() * 60 + date.getMinutes();

      const fromMinutes = timelineFrom
        ? Number(timelineFrom.split(":")[0]) * 60 +
        Number(timelineFrom.split(":")[1])
        : 0;

      const toMinutes = timelineTo
        ? Number(timelineTo.split(":")[0]) * 60 +
        Number(timelineTo.split(":")[1])
        : 1439;

      if (fromMinutes <= toMinutes) {
        return (
          minutes >= fromMinutes &&
          minutes <= toMinutes
        );
      }

      // Overnight range, e.g. 18:00 → 02:00
      return (
        minutes >= fromMinutes ||
        minutes <= toMinutes
      );
    });

    return {
      ...user,
      screenshots: filteredShots,
    };
  });

  const applyTimelinePreset = (preset: string) => {
    setTimelinePreset(preset);

    switch (preset) {
      case "morning":
        setTimelineFrom("06:00");
        setTimelineTo("12:00");
        break;

      case "afternoon":
        setTimelineFrom("12:00");
        setTimelineTo("17:00");
        break;

      case "evening":
        setTimelineFrom("17:00");
        setTimelineTo("22:00");
        break;

      case "workday":
        setTimelineFrom("09:00");
        setTimelineTo("18:00");
        break;

      default:
        setTimelineFrom("");
        setTimelineTo("");
        setTimelinePreset("all");
        break;
    }
  };

  return (
    <div className="bg-white border border-gray-200 border-t-0 rounded-b-md">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">

        {/* Main Controls */}
        <div className="px-5 py-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

            {/* Left Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full sm:w-[260px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* View Toggle */}
              <div className="flex h-[42px] border border-gray-300 rounded-lg overflow-hidden bg-white shrink-0">
                <button
                  type="button"
                  title="Gallery view"
                  onClick={() => setView("gallery")}
                  className={`px-5 text-sm font-medium transition ${view === "gallery"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Gallery
                </button>

                <button
                  type="button"
                  title="Timeline view"
                  onClick={() => setView("timeline")}
                  className={`px-5 text-sm font-medium transition ${view === "timeline"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Timeline
                </button>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-4">

              {/* Capture Filter */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 hidden sm:inline">
                  Showing:
                </span>

                <button
                  title="Captured"
                  onClick={() => setCaptureFilter("captured")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${captureFilter === "captured"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Captured
                </button>

                <button
                  title="Uncaptured"
                  onClick={() => setCaptureFilter("uncaptured")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${captureFilter === "uncaptured"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Uncaptured
                </button>
              </div>

              {/* User Count */}
              <div className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Users: <span className="text-gray-900">{finalUsers.length}</span>
              </div>

              {/* Export */}
              <button
                title="Export screenshots"
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Filter */}
        {view === "timeline" && (
          <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              {/* Label */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                  <Clock3 className="h-4 w-4 text-indigo-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Timeline filter
                  </p>

                  <p className="text-[11px] text-gray-500">
                    Filter screenshots by capture time
                  </p>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Preset */}
                <div className="flex h-[38px] items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 shadow-sm">
                  <select
                    value={timelinePreset}
                    onChange={(e) => applyTimelinePreset(e.target.value)}
                    className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="all">All Day</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="workday">Workday</option>
                    <option value="custom">Custom</option>
                  </select>

                  <ChevronDown className="h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* From */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    From
                  </span>

                  <input
                    type="time"
                    value={timelineFrom}
                    onChange={(e) => {
                      setTimelineFrom(e.target.value);
                      setTimelinePreset("custom");
                    }}
                    className="h-[38px] w-[125px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    title="Timeline start time"
                  />
                </div>

                {/* Arrow */}
                <span className="text-gray-400 text-sm px-1">
                  →
                </span>

                {/* To */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    To
                  </span>

                  <input
                    type="time"
                    value={timelineTo}
                    onChange={(e) => {
                      setTimelineTo(e.target.value);
                      setTimelinePreset("custom");
                    }}
                    className="h-[38px] w-[125px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    title="Timeline end time"
                  />
                </div>

                {/* Clear */}
                {(timelineFrom || timelineTo) && (
                  <button
                    type="button"
                    onClick={() => applyTimelinePreset("all")}
                    className="h-[38px] rounded-lg px-3 text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 pb-4 pl-5 mb-1 mt-1">
        <h2 className="text-xl font-bold text-gray-800">
          Screenshots
        </h2>
      </div>

      {/* Cards */}
      {view === "gallery" ? (
        <div className="p-6">
          {finalUsers.length === 0 ? (
            <div className="min-h-[260px] flex flex-col items-center justify-center text-gray-400">
              <svg
                width="80"
                height="80"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 opacity-50"
              >
                <rect
                  x="8"
                  y="14"
                  width="48"
                  height="36"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="3"
                />

                <path
                  d="M20 14L24 9H40L44 14"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="32"
                  cy="31"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="3"
                />

                <circle
                  cx="32"
                  cy="31"
                  r="3"
                  fill="currentColor"
                />

                <path
                  d="M20 50H44"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              <p className="text-sm font-medium text-gray-500">
                {captureFilter === "captured"
                  ? "No screenshots captured"
                  : "All users have captured screenshots"}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {captureFilter === "captured"
                  ? "No users have captured screenshots for this day."
                  : "There are no uncaptured users for this day."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {finalUsers.map((user: any) => {
                const email = user.email;
                const userShots = user.screenshots;


                const latestShot =
                  userShots.length > 0
                    ? [...userShots].sort(
                      (a, b) =>
                        new Date(b.capturedAt).getTime() -
                        new Date(a.capturedAt).getTime()
                    )[0]
                    : null;

                return (
                  <div
                    key={email}
                    className="min-h-[330px] bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                      {user.avatar?.trim() ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-semibold">
                          {user.firstName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}

                      <h3 className="text-[17px] font-bold text-indigo-700 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                    </div>

                    {/* Screenshot Area */}
                    <div className="h-[140px] bg-gray-100 overflow-hidden relative">
                      {latestShot?.imageUrl ? (
                        <Image
                          src={latestShot.imageUrl}
                          alt="Screenshot"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                          <Camera className="w-6 h-6 opacity-40" />
                          <span className="text-xs">No Screenshot</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-3">
                      <div className="flex items-center justify-between text-[15px] mb-2">
                        <div className="flex items-center gap-1 font-semibold text-gray-700">
                          <span>🕒</span>

                          <span>
                            {latestShot
                              ? new Date(latestShot.capturedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "--"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {latestShot && (
                            <div className="flex gap-[2px]">
                              {[1, 2, 3, 4, 5, 6, 7].map((dot) => (
                                <div
                                  key={dot}
                                  className="w-1 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: getActivityColor(
                                      latestShot?.activityScore || 0
                                    ),
                                  }}
                                />
                              ))}
                            </div>
                          )}

                          <span
                            className="font-medium"
                            style={{
                              color: getActivityColor(
                                latestShot?.activityScore || 0
                              ),
                            }}
                          >
                            {latestShot
                              ? `${latestShot.activityScore || 0}%`
                              : "--"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-semibold">
                          {userShots.length > 0
                            ? `${userShots.length} Screenshot${userShots.length > 1 ? "s" : ""}`
                            : "No Screenshots"}
                        </span>

                        <button
                          title='See all'
                          disabled={!userShots.length}
                          onClick={() => {
                            setSelectedUser({
                              email,
                              firstName: user.firstName,
                              lastName: user.lastName,
                              avatar: user.avatar,
                              screenshots: userShots,
                            });
                            setShowModal(true);
                          }}
                          className={`text-xs px-2 py-1 rounded-md ${userShots.length
                            ? "bg-blue-200 text-indigo-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          See all
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {timelineFilteredUsers.every(
            (user: any) => user.screenshots.length === 0
          ) ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <Camera className="mx-auto h-10 w-10 text-gray-300" />

              <h3 className="mt-4 text-sm font-semibold text-gray-800">
                No screenshots found
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Try changing the date, time, or user filters.
              </p>
            </div>
          ) : (
            timelineFilteredUsers.map((user: any) => {
              const userShots = [...(user.screenshots || [])].sort(
                (a: any, b: any) =>
                  new Date(a.capturedAt).getTime() -
                  new Date(b.capturedAt).getTime()
              );

              if (userShots.length === 0) {
                return null;
              }

              const firstShotTime = new Date(
                userShots[0].capturedAt
              ).getTime();

              const lastShotTime = new Date(
                userShots[userShots.length - 1].capturedAt
              ).getTime();

              const getTimeAtMidnight = (time: string) => {
                const [hours = 0, minutes = 0] = time
                  .split(":")
                  .map(Number);

                const date = new Date(firstShotTime);

                date.setHours(hours, minutes, 0, 0);

                return date.getTime();
              };

              const timelineStart =
                timelineFrom
                  ? getTimeAtMidnight(timelineFrom)
                  : firstShotTime;

              const timelineEnd =
                timelineTo
                  ? getTimeAtMidnight(timelineTo)
                  : lastShotTime;

              const isOvernightTimeline =
                !!timelineFrom &&
                !!timelineTo &&
                timelineFrom > timelineTo;

              const firstTime = timelineStart;

              const lastTime = isOvernightTimeline
                ? timelineEnd + 24 * 60 * 60 * 1000
                : timelineEnd;

              const range = Math.max(
                lastTime - firstTime,
                60 * 1000
              );

              const getTimelinePosition = (shot: any) => {
                let currentTime = new Date(
                  shot.capturedAt
                ).getTime();

                if (isOvernightTimeline && currentTime < firstTime) {
                  currentTime += 24 * 60 * 60 * 1000;
                }

                return Math.min(
                  100,
                  Math.max(
                    0,
                    ((currentTime - firstTime) / range) * 100
                  )
                );
              };

              return (
                <div
                  key={user.email}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* USER HEADER */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {user.avatar?.trim() ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                          {user.firstName?.charAt(0).toUpperCase() || "U"}
                          {user.lastName?.charAt(0).toUpperCase() || ""}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>

                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                      {userShots.length} screenshot
                      {userShots.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* TIMELINE */}
                  {/* TIMELINE */}
                  <div className="px-5 py-6">

                    {/* Time Range Header */}
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Timeline
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-700">
                          {userShots.length} screenshot
                          {userShots.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">
                          {new Date(firstTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <span className="text-gray-300">→</span>

                        <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">
                          {new Date(lastTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Scrollable Timeline */}
                    <div className="overflow-x-auto pb-3">
                      <div
                        className="relative h-[400px]"
                        style={{
                          minWidth: `${Math.max(
                            1000,
                            userShots.length * 190
                          )}px`,
                        }}
                      >

                        {/* Time Labels */}
                        <div className="absolute left-0 right-0 top-1 h-5 text-[11px] text-gray-400">
                          {[0, 25, 50, 75, 100].map((percent) => {
                            const labelTime = new Date(
                              firstTime + (range * percent) / 100
                            );

                            return (
                              <span
                                key={percent}
                                className="absolute -translate-x-1/2 whitespace-nowrap font-medium"
                                style={{
                                  left: `${percent}%`,
                                }}
                              >
                                {labelTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            );
                          })}
                        </div>

                        {/* Vertical Grid Lines */}
                        <div className="absolute left-0 right-0 top-8 bottom-8 pointer-events-none">
                          {[0, 25, 50, 75, 100].map((value) => (
                            <div
                              key={value}
                              className="absolute top-0 bottom-0 w-px bg-gray-100"
                              style={{
                                left: `${value}%`,
                              }}
                            />
                          ))}
                        </div>

                        {/* Main Timeline Track */}
                        <div className="absolute left-[6%] right-[6%] top-[190px]">

                          <div className="h-1 rounded-full bg-gray-200" />

                          {/* Progress */}
                          <div
                            className="absolute left-0 top-0 h-1 rounded-full bg-indigo-200"
                            style={{
                              width: "100%",
                            }}
                          />

                          {/* Start Point */}
                          <div className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-indigo-600 shadow-md" />

                          {/* End Point */}
                          <div className="absolute right-0 top-1/2 h-4 w-4 translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-indigo-600 shadow-md" />
                        </div>

                        {/* Screenshot Events */}
                        {userShots.map((shot: any, index: number) => {
                          const position = getTimelinePosition(shot);

                          const safePosition = Math.min(
                            94,
                            Math.max(6, position)
                          );

                          const above = index % 2 === 0;

                          return (
                            <div
                              key={shot._id}
                              className="absolute top-0 h-full"
                              style={{
                                left: `${safePosition}%`,
                                width: "0px",
                              }}
                            >

                              {/* Connector */}
                              <div
                                className={`absolute left-1/2 w-px -translate-x-1/2 bg-indigo-300 ${above
                                  ? "top-[105px] h-[85px]"
                                  : "top-[190px] h-[70px]"
                                  }`}
                              />

                              {/* Event Point */}
                              <div
                                className="absolute left-1/2 top-[190px] z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-indigo-600 shadow-md"
                              />

                              {/* Screenshot Card */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedShot(shot);
                                  setShowModal(true);
                                }}
                                className={`group absolute left-1/2 z-10 w-[180px] -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg ${above
                                  ? "top-[20px]"
                                  : "top-[265px]"
                                  }`}
                              >

                                {/* Screenshot */}
                                <div className="relative h-[92px] w-full overflow-hidden bg-gray-100">
                                  {shot.imageUrl ? (
                                    <Image
                                      src={shot.imageUrl}
                                      alt="Screenshot"
                                      fill
                                      unoptimized
                                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <Camera className="h-5 w-5 text-gray-300" />
                                    </div>
                                  )}

                                  {/* Time Badge */}
                                  <div className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                                    {new Date(
                                      shot.capturedAt
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>

                                {/* Card Info */}
                                <div className="flex items-center justify-between px-3 py-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{
                                        backgroundColor: getActivityColor(
                                          shot.activityScore || 0
                                        ),
                                      }}
                                    />

                                    <span className="text-[11px] font-medium text-gray-600">
                                      Activity
                                    </span>
                                  </div>

                                  <span className="text-[11px] font-semibold text-gray-700">
                                    {shot.activityScore || 0}%
                                  </span>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timeline Footer */}
                    <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        Screenshot captured
                      </div>

                      <span className="text-[11px] text-gray-400">
                        Click a screenshot to preview
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )
      }

      {
        showModal && selectedUser && (
          <ScreenshotModal
            user={selectedUser}
            onClose={() =>
              setShowModal(false)
            }
          />
        )
      }

      {selectedShot && (
        <ScreenshotDetailsModal
          screenshot={selectedShot}
          currentIndex={0}
          total={1}
          onPrevious={() => { }}
          onNext={() => { }}
          onClose={() =>
            setSelectedShot(null)
          }
        />
      )}
    </div >
  );
}