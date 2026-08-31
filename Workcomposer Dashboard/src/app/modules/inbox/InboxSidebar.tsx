"use client";

import { HiOutlineBriefcase } from "react-icons/hi2";
import { useDesktop } from "@/context/DesktopContext";
import DesktopModuleHeader from "../common/DesktopModuleHeader";

type Props = {
    desktop?: boolean;
};

export default function InboxSidebar({
    desktop = false,
}: Props) {
    const {
        activeInbox,
        setActiveInbox,
    } = useDesktop();

    return (
        <div className="space-y-1">

            {desktop && (
                <DesktopModuleHeader />
            )}

            <button
                type="button"
                onClick={() => setActiveInbox("manual-time")}
                className={`group flex w-full items-center gap-x-3 p-2 text-sm font-semibold transition-all duration-200 ${activeInbox === "manual-time"
                        ? "bg-linear-to-r from-indigo-900/70 to-gray-800 border-l-3 border-indigo-500 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <HiOutlineBriefcase className="h-5 w-5" />
                </div>

                <span className="font-bold">
                    Manual Time Requests
                </span>
            </button>

        </div>
    );
}