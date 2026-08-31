"use client";

import { HiOutlineEnvelopeOpen } from "react-icons/hi2";
import { HiOutlineInboxStack } from "react-icons/hi2";
import { Menu } from 'lucide-react';
import { useDesktop } from "@/context/DesktopContext";
import { useEffect, useState } from "react";
import API from "@/api";
import ReportsModal from "@/app/dashboard/time-tracking/attendance/reports/ReportsModal";
import NotificationBell from "@/components/notifications/NotificationBell";


export default function DesktopPageHeader() {

    const {
        activePage,
        setActivePage,
        moduleSidebarOpen,
        setModuleSidebarOpen,
    } = useDesktop();

    const [pendingCount, setPendingCount] = useState(0);
    const [reportsOpen, setReportsOpen] = useState(false);

    const fetchPendingCount = async () => {
        try {
            const { data } = await API.get("/manual-time-requests/count");

            setPendingCount(data.count);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPendingCount();

        const interval = setInterval(fetchPendingCount, 10000);

        const refresh = () => fetchPendingCount();

        window.addEventListener("refreshInboxCount", refresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener("refreshInboxCount", refresh);
        };
    }, []);


    return (
        <div className="fixed top-16 left-[78px] xl:left-[366px] right-0 z-30 flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">

            <button
                onClick={() =>
                    setModuleSidebarOpen(!moduleSidebarOpen)
                }
                className="hidden max-xl:flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100"
                title="Open menu"
            >
                <Menu className="h-6 w-6" />
            </button>


            <div className="ml-auto flex items-center gap-4">
                <NotificationBell />

                <div className="relative">
                    <button
                        onClick={() =>
                            setActivePage(
                                activePage === "inbox"
                                    ? "dashboard"
                                    : "inbox"
                            )
                        }
                        className={`transition-colors ${activePage === "inbox"
                            ? "text-indigo-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        title="Inbox"
                    >
                        <HiOutlineEnvelopeOpen className="w-6 h-6" />
                    </button>

                    {pendingCount > 0 && (
                        <span
                            className="
                absolute
                -top-2
                -right-2
                min-w-[18px]
                h-[18px]
                px-1
                rounded-full
                bg-red-600
                text-white
                text-[10px]
                font-bold
                flex
                items-center
                justify-center
                pointer-events-none
            "
                        >
                            {pendingCount}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setReportsOpen(true)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="Reports"
                >
                    <HiOutlineInboxStack className="w-6 h-6" />
                </button>
            </div>

            <ReportsModal
                open={reportsOpen}
                onClose={() => setReportsOpen(false)}
            />
        </div>
    );
}