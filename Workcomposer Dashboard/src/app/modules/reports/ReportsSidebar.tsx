"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import {
    HiUsers,
    HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

import {
    Camera,
    Clock3,
    Globe,
    MapPin,
} from "lucide-react";

import { BsBarChart } from "react-icons/bs";
import { useState } from "react";
import DesktopModuleHeader from "../common/DesktopModuleHeader";
import useDesktopNavigation from "@/hooks/useDesktopNavigation";

type ReportsSidebarProps = {
    activeReport?: string;
    setActiveReport?: React.Dispatch<React.SetStateAction<string>>;
    desktop?: boolean;
};
export default function ReportsSidebar({
    activeReport,
    setActiveReport,
    desktop = false,
}: ReportsSidebarProps) {

    const [isOpen, setIsOpen] = useState(false);

    const { closeSidebar } = useDesktopNavigation(desktop);

    const pathname = usePathname();

    const router = useRouter();

    const { user } = useDashboard();

    const canViewScreenshots =
        user?.screenshotAccess !== "none";

    const getClass = (path: string) =>
        `router-link-active router-link-exact-active bg-linear-to-r from-indigo-900/70 to-gray-800 shadow-md text-white border-l-3 border-indigo-500 group flex items-center gap-x-3 p-2 text-sm font-semibold -mx-3 px-3 transition-all duration-200 ease-in-out ${pathname !== path
            ? "bg-none text-gray-400 border-none"
            : ""
        }`;

    const navigate = (report: string, path: string) => {

        closeSidebar();

        if (setActiveReport) {
            setActiveReport(report);
            return;
        }

        router.push(path);
    };

    return (
        <div className="space-y-1">

            <>
                {desktop && (
                    <DesktopModuleHeader />
                )}

                <a
                    href="/dashboard/time-tracking/overview"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(false);
                        navigate("overview", "/dashboard/time-tracking/overview")
                    }}
                    className={getClass("/dashboard/time-tracking/overview")}
                >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8">
                        <HiUsers className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold">Overview</span>
                </a>

                {/* Screenshots */}
                {canViewScreenshots && (
                    <a
                        href="/dashboard/time-tracking/screenshots"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(false);
                            navigate("screenshots", "/dashboard/time-tracking/screenshots")
                        }}
                        className={getClass("/dashboard/time-tracking/screenshots")}
                    >
                        <div className="shrink-0 flex items-center justify-center w-8 h-8">
                            <Camera className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="text-sm font-bold">Screenshots</span>
                    </a>
                )}

                {/* Attendance */}
                <a
                    href="/dashboard/time-tracking/attendance"
                    onClick={(e) => {
                        e.preventDefault();

                        navigate(
                            "attendance",
                            "/dashboard/time-tracking/attendance"
                        );
                    }}
                    className={getClass("/dashboard/time-tracking/attendance")}
                >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8">
                        <Clock3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold">Attendance</span>
                </a>

                {/* Usage */}
                <a
                    href="/dashboard/time-tracking/usage"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(false);
                        navigate("usage", "/dashboard/time-tracking/usage")
                    }}
                    className={getClass("/dashboard/time-tracking/usage")}
                >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8">
                        <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold">Web & App Usage</span>
                </a>

                {/* Productivity */}
                <a
                    href="/dashboard/time-tracking/productivity"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(false);
                        navigate("productivity", "/dashboard/time-tracking/productivity")
                    }}
                    className={getClass(
                        "/dashboard/time-tracking/productivity",
                    )}
                >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8">
                        <BsBarChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold">Productivity</span>
                </a>

                {/* Projects */}
                <a
                    href="/dashboard/time-tracking/projects"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(false);
                        navigate("project-tracking", "/dashboard/time-tracking/project-tracking")
                    }}
                    className={getClass("/dashboard/time-tracking/projects")}
                >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8">
                        <HiOutlineClipboardDocumentList className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold">Project Tracking</span>
                </a>

                {/* Location */}
                {user?.permissions?.includes("manage_users") && (
                    <a
                        href="/dashboard/time-tracking/location"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(false);
                            navigate(
                                "location",
                                "/dashboard/time-tracking/location"
                            );
                        }}
                        className={getClass("/dashboard/time-tracking/location")}
                    >
                        <div className="shrink-0 flex items-center justify-center w-8 h-8">
                            <MapPin className="h-5 w-5 text-gray-400" />
                        </div>

                        <span className="text-sm font-bold">
                            Location
                        </span>
                    </a>
                )}
            </>

        </div>

    );

}