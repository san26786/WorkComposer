"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import logo from "@/assets/dashboard workcomposer logo.png";
import {
  HiBars3,
} from "react-icons/hi2";

import Image from "next/image";
import ReportsSidebar from "@/app/modules/reports/ReportsSidebar";
import UsersSidebar from "@/app/modules/users-management/UsersSidebar";
import ProjectsSidebar from "@/app/modules/task-management/ProjectsSidebar";
import SettingsSidebar from "@/app/modules/settings/SettingsSidebar";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const searchParams = useSearchParams();

  const activeTeam =
    searchParams.get("team") || "All Teams";


  const isTimeTracking =
    pathname.startsWith("/dashboard/time-tracking") ||
    pathname === "/dashboard";
  const isTaskManagement = pathname.startsWith("/dashboard/task-management");
  const isUserManagement = pathname.startsWith("/dashboard/user-management");
  const isSettings = pathname.startsWith("/dashboard/settings");


  const getClass = (path: string) =>
    `router-link-active router-link-exact-active bg-linear-to-r from-indigo-900/70 to-gray-800 shadow-md text-white border-l-3 border-indigo-500 group flex items-center gap-x-3 p-2 text-sm font-semibold -mx-3 px-3 transition-all duration-200 ease-in-out ${pathname !== path ? "bg-none text-gray-400 border-none" : ""
    }`;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-60 lg:hidden p-2 rounded-md text-gray-700 shadow-lg transition-opacity duration-200"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <HiBars3 className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div
        className={`fixed lg:static inset-y-0 z-50 flex flex-col bg-gray-900 
  w-64 lg:w-64 xl:w-72
  transition-transform duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0`}
      >
        <div className="flex grow flex-col overflow-y-auto px-3 pb-4">
          <div className="flex h-16 shrink-0 items-center cursor-pointer px-3">
            <div className="flex items-center">
              <Image
                className="h-7 w-auto"
                src={logo}
                alt="WorkComposer"
                priority
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 mt-4 px-3">
            <h2 className="text-white font-semibold text-lg">
              {isUserManagement
                ? "User Management"
                : isTaskManagement
                  ? "Task Management"
                  : isSettings
                    ? "Settings"
                    : "Time Tracking"}
            </h2>
          </div>

          <nav className="flex flex-1 flex-col mt-2">
            <div className="space-y-1">
              {/* Time Tracking  */}
              {isTimeTracking && (
                <ReportsSidebar />
              )}

              {/* USER - MANAGEMENT  */}

              {isUserManagement && (
                <UsersSidebar
                  activeTeam={activeTeam}
                />
              )}

              {/* TASK MANAGEMENT */}

              {isTaskManagement && (
                <ProjectsSidebar />
              )}

              {/* SETTINGS */}

              {isSettings && (
                <SettingsSidebar />
              )}

            </div>
          </nav>
        </div>
      </div>

    </>
  );
};

export default Sidebar;
