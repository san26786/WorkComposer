"use client"

import { useEffect, useState } from "react";
import { CiUser } from "react-icons/ci";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { Clock3, Loader2 } from 'lucide-react';
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useDesktop } from "@/context/DesktopContext";
import DesktopModuleHeader from "../common/DesktopModuleHeader";
import useDesktopNavigation from "@/hooks/useDesktopNavigation";

type Props = {
    desktop?: boolean;
    activeSetting?: string;
    setActiveSetting?: React.Dispatch<
        React.SetStateAction<string>
    >;
};

type NavSpinnerProps = {
    loading: boolean;
};

const NavSpinner = ({ loading }: NavSpinnerProps) => {
    if (!loading) return null;

    return (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-300" />
    );
};

const SettingsSidebar = ({
    desktop = false,
    activeSetting,
    setActiveSetting,
}: Props) => {

    const { closeSidebar } = useDesktopNavigation(desktop);

    const pathname = usePathname();
    const { user } = useDashboard();

    const [loadingKey, setLoadingKey] = useState<string | null>(null);

    // Clear the loading indicator once the target section/page
    // actually becomes active (desktop: activeSetting, web: pathname).
    useEffect(() => {
        setLoadingKey(null);
    }, [activeSetting, pathname]);

    const handleDesktopNav = (key: string) => {
        closeSidebar();
        setLoadingKey(key);
        setActiveSetting?.(key);
    };

    const handleWebNav = (key: string) => {
        setLoadingKey(key);
    };

    const canManageSettings =
        user?.permissions?.includes("manage_settings");

    const linkClass = (
        href: string,
        key?: string,
    ) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition ${desktop
            ? activeSetting === key
                ? "nav-opt2 router-link-active router-link-exact-active font-semibold"
                : "font-medium text-slate-400 hover:text-white hover:bg-white/[0.05]"
            : pathname.startsWith(href)
                ? "nav-opt2 router-link-active router-link-exact-active font-semibold"
                : "font-medium text-slate-400 hover:text-white hover:bg-white/[0.05]"
        }`;

    return (
        <>
            {desktop && (
                <DesktopModuleHeader />
            )}

            <div
                className={`-mx-1 px-1 pt-2 scroll-thin ${desktop
                    ? "flex-1 overflow-y-auto min-h-0 pb-6"
                    : "overflow-y-auto min-h-0"
                    }`}
            >
                <nav aria-label="App sections" className="space-y-0.5">
                    <div data-test="settings-group-0" className="mb-3">
                        <button type="button" className="group w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition text-indigo-300">
                            <CiUser className="h-4 w-4 shrink-0" />
                            <span className="flex-1 text-left">Personal</span>
                        </button>

                        <div className="pl-[26px] space-y-0.5">
                            {desktop ? (
                                <button
                                    type="button"
                                    onClick={() => handleDesktopNav("profile")}
                                    className={linkClass("", "profile")}
                                >
                                    <span className="lead-dot"></span>
                                    <span className="flex-1 text-left">
                                        Profile
                                    </span>
                                    <NavSpinner loading={loadingKey === "profile"} />
                                </button>
                            ) : (
                                <Link
                                    href="/dashboard/settings/profile"
                                    onClick={() => handleWebNav("profile")}
                                    className={linkClass("/dashboard/settings/profile")}
                                >
                                    <span className="lead-dot"></span>
                                    <span className="flex-1">
                                        Profile
                                    </span>
                                    <NavSpinner loading={loadingKey === "profile"} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {canManageSettings && (
                        <>
                            <div data-test="settings-group-1" className="mb-3">
                                <button type="button" className="group w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]">
                                    <HiBuildingOffice2 className="h-4 w-4 shrink-0" />
                                    <span className="flex-1 text-left">Account & Security</span>
                                </button>
                                <div className="pl-[26px] space-y-0.5">
                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("organization-profile")}
                                            className={linkClass("", "organization-profile")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">
                                                Organization Profile
                                            </span>
                                            <NavSpinner loading={loadingKey === "organization-profile"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/organization-profile"
                                            onClick={() => handleWebNav("organization-profile")}
                                            className={linkClass("/dashboard/settings/organization-profile")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">
                                                Organization Profile
                                            </span>
                                            <NavSpinner loading={loadingKey === "organization-profile"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("security")}
                                            className={linkClass("", "security")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">
                                                Security & Compliance
                                            </span>
                                            <NavSpinner loading={loadingKey === "security"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/account/security"
                                            onClick={() => handleWebNav("security")}
                                            className={linkClass("/dashboard/settings/account/security")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">
                                                Security & Compliance
                                            </span>
                                            <NavSpinner loading={loadingKey === "security"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("roles-privilages")}
                                            className={linkClass("", "roles-privilages")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">
                                                Roles & Privileges
                                            </span>
                                            <NavSpinner loading={loadingKey === "roles-privilages"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/account/roles-privilages"
                                            onClick={() => handleWebNav("roles-privilages")}
                                            className={linkClass("/dashboard/settings/account/roles-privilages")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">
                                                Roles & Privileges
                                            </span>
                                            <NavSpinner loading={loadingKey === "roles-privilages"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("integrations")}
                                            className={linkClass("", "integrations")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">
                                                Integrations
                                            </span>
                                            <NavSpinner loading={loadingKey === "integrations"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/account/integrations"
                                            onClick={() => handleWebNav("integrations")}
                                            className={linkClass("/dashboard/settings/account/integrations")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">
                                                Integrations
                                            </span>
                                            <NavSpinner loading={loadingKey === "integrations"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("api-access")}
                                            className={linkClass("", "api-access")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">
                                                API Access
                                            </span>
                                            <NavSpinner loading={loadingKey === "api-access"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/account/api-access"
                                            onClick={() => handleWebNav("api-access")}
                                            className={linkClass("/dashboard/settings/account/api-access")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">
                                                API Access
                                            </span>
                                            <NavSpinner loading={loadingKey === "api-access"} />
                                        </Link>
                                    )}
                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("billings")}
                                            className={linkClass("", "billings")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">
                                                Billing & Usage
                                            </span>
                                            <NavSpinner loading={loadingKey === "billings"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/account/billings"
                                            onClick={() => handleWebNav("billings")}
                                            className={linkClass("/dashboard/settings/account/billings")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">
                                                Billing & Usage
                                            </span>
                                            <NavSpinner loading={loadingKey === "billings"} />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div data-test="settins-group-2" className="mb-3">
                                <button type="button" className="group w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]">
                                    <Clock3 className="h-4 w-4 shrink-0" />
                                    <span className="flex-1 text-left">Time Tracking</span>
                                </button>
                                <div className="pl-[26px] space-y-0.5">

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("tracking")}
                                            className={linkClass("", "tracking")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">Tracking</span>
                                            <NavSpinner loading={loadingKey === "tracking"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/time-tracking/tracking"
                                            onClick={() => handleWebNav("tracking")}
                                            className={linkClass("/dashboard/settings/time-tracking/tracking")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">Tracking</span>
                                            <NavSpinner loading={loadingKey === "tracking"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("screen-capture")}
                                            className={linkClass("", "screen-capture")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">Screen Capture</span>
                                            <NavSpinner loading={loadingKey === "screen-capture"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/time-tracking/screen-capture"
                                            onClick={() => handleWebNav("screen-capture")}
                                            className={linkClass("/dashboard/settings/time-tracking/screen-capture")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">Screen Capture</span>
                                            <NavSpinner loading={loadingKey === "screen-capture"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("manual-time")}
                                            className={linkClass("", "manual-time")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">Manual Time</span>
                                            <NavSpinner loading={loadingKey === "manual-time"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/time-tracking/manual-time"
                                            onClick={() => handleWebNav("manual-time")}
                                            className={linkClass("/dashboard/settings/time-tracking/manual-time")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">Manual Time</span>
                                            <NavSpinner loading={loadingKey === "manual-time"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("productivity")}
                                            className={linkClass("", "productivity")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">Productivity</span>
                                            <NavSpinner loading={loadingKey === "productivity"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/time-tracking/productivity"
                                            onClick={() => handleWebNav("productivity")}
                                            className={linkClass("/dashboard/settings/time-tracking/productivity")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">Productivity</span>
                                            <NavSpinner loading={loadingKey === "productivity"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("shifts")}
                                            className={linkClass("", "shifts")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">Shifts</span>
                                            <NavSpinner loading={loadingKey === "shifts"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/time-tracking/shifts"
                                            onClick={() => handleWebNav("shifts")}
                                            className={linkClass("/dashboard/settings/time-tracking/shifts")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">Shifts</span>
                                            <NavSpinner loading={loadingKey === "shifts"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("email-reports")}
                                            className={linkClass("", "email-reports")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">Email Reports</span>
                                            <NavSpinner loading={loadingKey === "email-reports"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/time-tracking/email-reports"
                                            onClick={() => handleWebNav("email-reports")}
                                            className={linkClass("/dashboard/settings/time-tracking/email-reports")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">Email Reports</span>
                                            <NavSpinner loading={loadingKey === "email-reports"} />
                                        </Link>
                                    )}

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("notifications")}
                                            className={linkClass("", "notifications")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">Notifications</span>
                                            <NavSpinner loading={loadingKey === "notifications"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/time-tracking/notifications"
                                            onClick={() => handleWebNav("notifications")}
                                            className={linkClass(
                                                "/dashboard/settings/time-tracking/notifications"
                                            )}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">Notifications</span>
                                            <NavSpinner loading={loadingKey === "notifications"} />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div data-test="settings-group-3" className="mb-3">
                                <button type="button" className="group w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]">
                                    <HiOutlineClipboardDocumentList className="h-4 w-4 shrink-0" />
                                    <span className="flex-1 text-left">Task Management</span>
                                </button>
                                <div className="pl-[26px] space-y-0.5">

                                    {desktop ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDesktopNav("projects")}
                                            className={linkClass("", "projects")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1 text-left">
                                                Projects & Tasks
                                            </span>
                                            <NavSpinner loading={loadingKey === "projects"} />
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dashboard/settings/task-management/projects"
                                            onClick={() => handleWebNav("projects")}
                                            className={linkClass("/dashboard/settings/task-management/projects")}
                                        >
                                            <span className="lead-dot"></span>
                                            <span className="flex-1">
                                                Projects & Tasks
                                            </span>
                                            <NavSpinner loading={loadingKey === "projects"} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </nav>
            </div>
        </>
    )
}

export default SettingsSidebar