"use client";

import { ChevronDown, X } from "lucide-react";
import { CiImport } from "react-icons/ci";
import { CiViewColumn } from "react-icons/ci";
import Image from 'next/image';
import API from "@/api";
import { useEffect, useRef, useState } from "react";
import AppUsageChart from './AppUsageChart';
import UsageDetailsModal from "./UsageDetailsModal";
import FullListModal from "./FullListModal";
import ReportsModal from "../attendance/reports/ReportsModal";
import UserProfileTrigger from "@/components/UserProfileTrigger";

type Props = {
  usageData: any[];
  allUsers: any[];
  reportRange: {
    type: string;
    startDate: Date;
    endDate: Date;
  };
};

export default function WebAppUsageCard({
  usageData,
  allUsers,
  reportRange,
}: Props) {

  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openFullList, setOpenFullList] = useState(false);
  const [selectedFullListUser, setSelectedFullListUser] = useState<any>(null);
  const [searchApp, setSearchApp] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const appNames = [
    ...new Set(
      usageData.flatMap((user) =>
        user.apps.map((app: any) => app.name)
      )
    ),
  ].sort();

  const filteredApps = appNames.filter((app) =>
    app.toLowerCase().includes(searchApp.toLowerCase())
  );

  const filteredUsageData =
    searchApp === ""
      ? usageData
      : usageData.filter((user) =>
        user.apps.some(
          (app: any) => app.name === searchApp
        )
      );

  const generateUsageReport = async () => {
    try {
      await API.post("/reports/usage", {
        startDate: reportRange.startDate
          .toISOString()
          .split("T")[0],

        endDate: reportRange.endDate
          .toISOString()
          .split("T")[0],
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-250px)] rounded-b-lg bg-white shadow-sm border-l border-r border-b border-gray-200">
        <div className="overflow-visible bg-gray-50 divide-y divide-gray-200">
          <div className="px-3 py-2 sm:px-5 bg-white shadow-sm border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg font-bold text-gray-800">Web and App Usage</h2>
              <div className="flex items-center gap-2">
                <div
                  ref={dropdownRef}
                  className="relative"
                >
                  <div className="relative w-64 shadow-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                    <input
                      type="text"
                      placeholder="Search app"
                      value={searchApp}
                      onChange={(e) => {
                        setSearchApp(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-300 pr-10"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">

                      {searchApp && (

                        <button
                          type="button"
                          onClick={() => {
                            setSearchApp("");
                            setShowDropdown(false);
                          }}
                          className="mr-1 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>

                      )}

                      <button
                        type="button"
                        onClick={() => setShowDropdown((prev) => !prev)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Toggle suggestions"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                    </div>
                    {showDropdown && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto overscroll-contain">

                        {filteredApps.length === 0 ? (

                          <div className="px-3 py-2 text-sm text-gray-500">
                            No apps found
                          </div>

                        ) : (

                          <ul>

                            <li
                              onClick={() => {
                                setSearchApp("");
                                setShowDropdown(false);
                              }}
                              className={`px-3 py-2 cursor-pointer border-b transition-colors ${searchApp === ""
                                ? "bg-indigo-100 text-indigo-700 font-medium"
                                : "hover:bg-indigo-50 text-gray-700"
                                }`}
                            >
                              All Apps
                            </li>

                            {filteredApps.map((app) => (

                              <li
                                key={app}
                                onClick={() => {
                                  setSearchApp(app);
                                  setShowDropdown(false);
                                }}
                                className={`px-3 py-2 cursor-pointer transition-colors ${searchApp === app
                                  ? "bg-indigo-100 text-indigo-700 font-medium"
                                  : "hover:bg-indigo-50"
                                  }`}
                              >
                                {app}
                              </li>

                            ))}

                          </ul>

                        )}

                      </div>
                    )}
                  </div>
                </div>

                <button
                  title="Export"
                  onClick={() => setOpenReports(true)}
                  className="inline-flex cursor-pointer items-center font-semibold px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <CiImport className="w-5 h-5 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className='px-6 py-6 sm:px-8'>
            {filteredUsageData.length === 0 ? (

              <div className="py-20 text-center">

                <CiViewColumn className="mx-auto h-12 w-12 text-gray-300 mb-4" />

                <h3 className="text-xl font-semibold text-gray-900">
                  No data available
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  App usage data will appear here once it&apos;s captured.
                </p>

              </div>

            ) : (
              filteredUsageData.map((user) => {

                const filteredUserApps =
                  searchApp === ""
                    ? user.apps
                    : user.apps.filter(
                      (app: any) => app.name === searchApp
                    );

                return (
                  <div
                    key={user._id}
                    className='p-4 mb-6 relative border-b border-gray-100'
                  >
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4'>

                      <div className='flex items-center'>
                        <span className='flex items-center'>

                          <UserProfileTrigger
                            user={
                              Array.isArray(allUsers)
                                ? allUsers.find(
                                  (profileUser) =>
                                    profileUser._id === user._id
                                )
                                : undefined
                            }
                            className="shrink-0 cursor-pointer rounded-full focus:outline-none"
                          >
                            {user.avatar?.trim() ? (
                              <img
                                src={user.avatar}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-indigo-400 transition"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-indigo-400 transition">
                                {user.firstName?.charAt(0)}
                              </div>
                            )}
                          </UserProfileTrigger>

                          <UserProfileTrigger
                            user={
                              Array.isArray(allUsers)
                                ? allUsers.find(
                                  (profileUser) =>
                                    profileUser._id === user._id
                                )
                                : undefined
                            }
                            className="ml-3 text-left"
                          >
                            <h3 className="text-blue-700 font-semibold text-lg cursor-pointer transition-colors flex items-center">
                              <span className="truncate max-w-xs">
                                {user.name}
                              </span>
                            </h3>
                          </UserProfileTrigger>

                        </span>
                      </div>

                      <div className='flex items-center gap-3 text-sm flex-wrap'>

                        <div className='flex items-center space-x-4'>

                          <div className='flex items-center space-x-4'>

                            <div className='flex items-center border-l-2 border-blue-500 pl-2'>
                              <span className='text-gray-500 font-medium'>
                                Work Time
                              </span>

                              <span className='font-semibold text-gray-800 ml-2'>
                                {user.workTime}
                              </span>
                            </div>

                            <div className='flex items-center border-l-2 border-amber-500 pl-2'>
                              <span className='text-gray-500 font-medium'>
                                Break Time
                              </span>

                              <span className='font-semibold text-gray-800 ml-2'>
                                {user.breakTime}
                              </span>
                            </div>

                          </div>

                        </div>

                        <button
                          title="Detailed log"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenModal(true);
                          }}
                          className="px-4 py-2 font-medium cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                        >
                          Detailed log
                        </button>

                        <button
                          title="Full list"
                          onClick={() => {
                            setSelectedFullListUser(user);
                            setOpenFullList(true);
                          }}
                          className='px-4 py-2 font-medium cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors'
                        >
                          Full list
                        </button>

                      </div>
                    </div>

                    {filteredUserApps.length === 0 ? (
                      <div className='text-center text-gray-500 py-8 bg-gray-50 rounded-lg'>
                        <CiViewColumn className='h-8 w-8 mx-auto text-gray-300 mb-2' />
                        <p>No app usage data available</p>
                        <p className='text-sm text-gray-400 mt-1'>
                          Data will appear once apps are used.
                        </p>
                      </div>
                    ) : (
                      <AppUsageChart
                        apps={filteredUserApps}
                      />
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <UsageDetailsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        user={selectedUser}
        reportRange={reportRange}
      />

      <FullListModal
        open={openFullList}
        onClose={() => setOpenFullList(false)}
        user={selectedFullListUser}
      />

      <ReportsModal
        open={openReports}
        onClose={() => setOpenReports(false)}
        autoGenerate
        onGenerate={generateUsageReport}
      />
    </>
  )
}


