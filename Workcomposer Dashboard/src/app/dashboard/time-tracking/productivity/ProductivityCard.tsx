"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOptionalDesktop } from "@/context/DesktopContext";
import { createPortal } from "react-dom";
import { FiSettings } from "react-icons/fi";
import { CiImport } from "react-icons/ci";
import { FaDesktop } from "react-icons/fa";
import { VscKebabVertical } from "react-icons/vsc";
import { Check } from 'lucide-react';
import { useEffect, useState, useRef } from "react";
import API from "@/api";
import Link from "next/link";
import ReportsModal from "../attendance/reports/ReportsModal";
import UserProfileTrigger from "@/components/UserProfileTrigger";

type ProductivityCardProps = {
    report: any[];
    loading: boolean;

    allUsers: any[];

    onGenerateReport: () => Promise<void>;
    onRefresh: () => Promise<void>;
    setReport: React.Dispatch<React.SetStateAction<any[]>>;
};

const ProductivityCard = ({
    report,
    loading,
    allUsers,
    onGenerateReport,
    onRefresh,
    setReport,
}: ProductivityCardProps) => {

    const router = useRouter();
    const desktop = useOptionalDesktop();

    const [reportsOpen, setReportsOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({
        x: 0,
        y: 0,
    });
    const [movingApp, setMovingApp] = useState<{
        name: string;
        target: "productive" | "neutral" | "unproductive";
    } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const portalMenuRef = useRef<HTMLDivElement>(null);

    const isDesktop =
        typeof window !== "undefined" && !!window.electronAPI;


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Click inside the portal menu
            if (
                portalMenuRef.current &&
                portalMenuRef.current.contains(target)
            ) {
                return;
            }

            // Click inside the card/menu button
            if (
                menuRef.current &&
                menuRef.current.contains(target)
            ) {
                return;
            }

            setOpenMenu(null);
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const classifyApp = async (

        appName: string,
        productivity: "productive" | "unproductive" | "neutral"
    ) => {
        try {

            await API.post("/reports/classify-app", {
                appName,
                productivity,
            });

            // Show temporary animation state
            setMovingApp({
                name: appName,
                target: productivity,
            });

            setReport((prev: any[]) =>
                prev.map((user) => {
                    const productiveApps = [...user.productiveApps];
                    const neutralApps = [...user.neutralApps];
                    const unproductiveApps = [...user.unproductiveApps];

                    let movedApp: any = null;

                    const removeApp = (apps: any[]) => {
                        const index = apps.findIndex((a) => a.name === appName);

                        if (index !== -1) {
                            movedApp = apps[index];
                            apps.splice(index, 1);
                        }
                    };

                    removeApp(productiveApps);
                    removeApp(neutralApps);
                    removeApp(unproductiveApps);

                    if (movedApp) {
                        if (productivity === "productive") {
                            productiveApps.unshift(movedApp);
                        } else if (productivity === "neutral") {
                            neutralApps.unshift(movedApp);
                        } else {
                            unproductiveApps.unshift(movedApp);
                        }
                    }

                    const productiveSeconds = productiveApps.reduce(
                        (sum, app) => sum + app.duration,
                        0
                    );

                    const neutralSeconds = neutralApps.reduce(
                        (sum, app) => sum + app.duration,
                        0
                    );

                    const unproductiveSeconds = unproductiveApps.reduce(
                        (sum, app) => sum + app.duration,
                        0
                    );

                    const total =
                        productiveSeconds +
                        neutralSeconds +
                        unproductiveSeconds;

                    return {
                        ...user,

                        productiveApps,
                        neutralApps,
                        unproductiveApps,

                        productivePercent:
                            total > 0
                                ? Math.round((productiveSeconds / total) * 100)
                                : 0,

                        neutralPercent:
                            total > 0
                                ? Math.round((neutralSeconds / total) * 100)
                                : 0,

                        unproductivePercent:
                            total > 0
                                ? Math.round((unproductiveSeconds / total) * 100)
                                : 0,
                    };
                })
            );

            setOpenMenu(null);

            // Wait before refreshing so the user can see the animation
            setTimeout(async () => {
                await onRefresh();
                setMovingApp(null);
            }, 700);

        } catch (err) {
            console.error(err);
        }
    };

    const renderMenu = (
        user: any,
        app: any,
        current: "productive" | "neutral" | "unproductive"
    ) => {
        return (
            <div
                ref={menuRef}
                className="flex-shrink-0 relative"
            >
                <button
                    type="button"
                    title="Change productivity status"
                    onClick={(e) => {
                        const rect = (
                            e.currentTarget as HTMLButtonElement
                        ).getBoundingClientRect();

                        setMenuPosition({
                            x: rect.right,
                            y: rect.bottom,
                        });

                        setOpenMenu(
                            openMenu === `${user._id}-${current}-${app.name}`
                                ? null
                                : `${user._id}-${current}-${app.name}`
                        );
                    }}
                    className="p-1 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <VscKebabVertical className="h-4 w-4" />
                </button>

                {openMenu === `${user._id}-${current}-${app.name}` &&
                    createPortal(
                        <div
                            ref={portalMenuRef}
                            className="fixed z-[9999] w-48 rounded-lg bg-white shadow-xl border border-gray-200"
                            style={{
                                left: menuPosition.x - 190,
                                top: menuPosition.y + 6,
                            }}
                        >
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                Move To
                            </div>

                            {current !== "productive" && (
                                <button
                                    onClick={() => classifyApp(app.name, "productive")}
                                    className="w-full flex items-center text-sm gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                                >
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Productive
                                </button>
                            )}

                            {current !== "neutral" && (
                                <button
                                    onClick={() => classifyApp(app.name, "neutral")}
                                    className="w-full flex items-center text-sm gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                                >
                                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                    Neutral
                                </button>
                            )}

                            {current !== "unproductive" && (
                                <button
                                    onClick={() => classifyApp(app.name, "unproductive")}
                                    className="w-full flex items-center text-sm gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                                >
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Unproductive
                                </button>
                            )}
                        </div>,
                        document.body
                    )}
            </div>
        );
    };

    return (
        <>
            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative h-12 w-12">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400" />

                            <div className="absolute inset-2 rounded-full bg-white" />

                            <div className="absolute inset-[14px] animate-pulse rounded-full bg-indigo-600" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-700">
                            Fetching content...
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Please wait while we update the productivity
                        </p>
                    </div>
                </div>
            ) : (

                <div className="min-h-[calc(100vh-250px)] rounded-b-lg bg-white shadow-sm border-l border-r border-b border-gray-200">
                    <div className="overflow-hidden bg-gray-50 divide-y divide-gray-200">
                        <div className="px-3 py-2 sm:px-5 bg-white shadow-sm border-b border-gray-200">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-lg font-bold text-gray-800 flex-shrink-0">Productivity</h2>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        title="Configure"
                                        onClick={() => {
                                            if (isDesktop && desktop) {
                                                desktop.setActivePage("settings");
                                                desktop.setActiveSetting?.("productivity");
                                                return;
                                            }

                                            router.push(
                                                "/dashboard/settings/time-tracking/productivity"
                                            );
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                                    >
                                        <FiSettings className="h-4 w-4" />
                                        Configure
                                    </button>
                                    <button
                                        title="Export"
                                        onClick={() => setReportsOpen(true)}
                                        className="inline-flex cursor-pointer items-center font-semibold px-4 py-2 text-sm rounded-md shadow-sm bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        <CiImport className="w-5 h-5 mr-2" />
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6 sm:px-8">

                            <div className="space-y-4">
                                {report.map((user) => {
                                    const ringColor =
                                        user.productivePercent >= 70
                                            ? "#22C55E"
                                            : user.productivePercent >= 40
                                                ? "#F59E0B"
                                                : "#EF4444";
                                    return (
                                        <div
                                            key={user._id}
                                            className="bg-white rounded-xl border border-gray-200 overflow-visible shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                                <div className="flex items-center justify-between gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center">
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
                                                                <Image
                                                                    src={
                                                                        user.avatar?.trim()
                                                                            ? user.avatar
                                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                                                                    }
                                                                    alt={user.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="rounded-full object-cover ring-2 ring-white shadow-md hover:ring-indigo-400 transition"
                                                                    unoptimized
                                                                />
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
                                                                <div className="cursor-pointer">
                                                                    <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">{user.name}</h3>
                                                                    <p className="text-sm text-gray-500 mt-0.5"> Total Tracked: {user.totalTracked} </p>
                                                                </div>
                                                            </UserProfileTrigger>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="relative w-16 h-16 flex-shrink-0">
                                                            <svg className="w-16 h-16 transform -rotate-90">
                                                                <circle cx={32} cy={32} r={28} stroke="#f3f4f6" strokeWidth={6} fill="none"></circle>
                                                                <circle
                                                                    cx={32}
                                                                    cy={32}
                                                                    r={28}
                                                                    stroke={ringColor}
                                                                    strokeWidth={6}
                                                                    fill="none"
                                                                    strokeDasharray={`${(user.productivePercent / 100) * 175.9} 175.9`}
                                                                    strokeLinecap="round"
                                                                    style={{
                                                                        transition:
                                                                            "stroke-dasharray 500ms ease, stroke 500ms ease",
                                                                    }}
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span
                                                                    style={{
                                                                        color: ringColor,
                                                                        transition: "color 500ms ease",
                                                                    }}
                                                                    className="text-base font-bold transition-all duration-500"
                                                                >
                                                                    {user.productivePercent}%
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-6">
                                                            <div className="text-center min-w-[80px]">
                                                                <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"> Productive </div>
                                                                <div className="text-lg font-bold text-green-600 transition-all duration-500">{user.productivePercent}%</div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {user.productiveTime}
                                                                </div>
                                                            </div>
                                                            <div className="text-center min-w-[80px]">
                                                                <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"> Neutral </div>
                                                                <div className="text-lg font-bold text-gray-600">{user.neutralPercent}%</div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {user.neutralTime}
                                                                </div>
                                                            </div>
                                                            <div className="text-center min-w-[80px]">
                                                                <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"> Unproductive </div>
                                                                <div className="text-lg font-bold text-red-600">{user.unproductivePercent}%</div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {user.unproductiveTime}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 divide-x divide-gray-200 overflow-visible">
                                                <div className="bg-white">
                                                    <div className="px-5 py-2 bg-green-50 border-b border-green-100">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide"> Productive </h4>
                                                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-md">{user.productiveApps.length}</span>
                                                        </div>
                                                    </div>
                                                    <div className="divide-y divide-gray-100 max-h-[180px] overflow-y-auto scrollable-column">
                                                        {user.productiveApps.length === 0 ? (
                                                            <div className="px-5 py-8 text-center text-sm text-gray-400">
                                                                No productive apps
                                                            </div>
                                                        ) : (
                                                            user.productiveApps.map((app: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className={`px-5 py-2.5 group relative hover:bg-gray-50 transition-all duration-700 ${movingApp?.name === app.name
                                                                        ? "opacity-50 scale-[0.98] bg-green-50"
                                                                        : "opacity-100 scale-100"
                                                                        }`}
                                                                    title={`${app.name} - ${app.time}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                                                            <FaDesktop className="w-5 h-5 rounded" />
                                                                        </div>

                                                                        <div className="flex-1 min-w-0 text-sm">
                                                                            <div
                                                                                className={`truncate transition-all duration-500 ${movingApp?.name === app.name
                                                                                    ? "line-through text-gray-400"
                                                                                    : ""
                                                                                    }`}
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {app.name}
                                                                                </span>

                                                                                <span className="text-gray-500">
                                                                                    {" - "}
                                                                                    {app.time}
                                                                                </span>
                                                                            </div>

                                                                            {movingApp?.name === app.name && (
                                                                                <div className="mt-1 flex items-center gap-2">
                                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                                                        → Moved to {movingApp?.target}
                                                                                    </span>

                                                                                    <Check className="w-4 h-4 text-green-500" />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {renderMenu(user, app, "productive")}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-white">
                                                    <div className="px-5 py-2 bg-gray-100 border-b border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide"> Neutral </h4>
                                                            <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2.5 py-1 rounded-md">{user.neutralApps.length}</span>
                                                        </div>
                                                    </div>
                                                    <div className="divide-y divide-gray-100 max-h-[180px] overflow-y-auto scrollable-column">
                                                        {user.neutralApps.length === 0 ? (
                                                            <div className="px-5 py-8 text-center text-sm text-gray-400">
                                                                No neutral apps
                                                            </div>
                                                        ) : (
                                                            user.neutralApps.map((app: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className={`px-5 py-2.5 group relative hover:bg-gray-50 transition-all duration-700 ${movingApp?.name === app.name
                                                                        ? "opacity-50 scale-[0.98] bg-green-50"
                                                                        : "opacity-100 scale-100"
                                                                        }`}
                                                                    title={`${app.name} - ${app.time}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                                                            <FaDesktop className="w-5 h-5 rounded" />
                                                                        </div>

                                                                        <div className="flex-1 min-w-0 text-sm">
                                                                            <div
                                                                                className={`truncate transition-all duration-500 ${movingApp?.name === app.name
                                                                                    ? "line-through text-gray-400"
                                                                                    : ""
                                                                                    }`}
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {app.name}
                                                                                </span>

                                                                                <span className="text-gray-500">
                                                                                    {" - "}
                                                                                    {app.time}
                                                                                </span>
                                                                            </div>

                                                                            {movingApp?.name === app.name && (
                                                                                <div className="mt-1 flex items-center gap-2">
                                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                                                        → Moved to {movingApp?.target}
                                                                                    </span>

                                                                                    <Check className="w-4 h-4 text-green-500" />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {renderMenu(user, app, "neutral")}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-white">
                                                    <div className="px-5 py-2 bg-red-50 border-b border-red-100">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide"> Unproductive </h4>
                                                            <span className="text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-md">{user.unproductiveApps.length}</span>
                                                        </div>
                                                    </div>
                                                    <div className="divide-y divide-gray-100 max-h-[180px] overflow-y-auto scrollable-column">
                                                        {user.unproductiveApps.length === 0 ? (
                                                            <div className="px-5 py-8 text-center text-sm text-gray-400">
                                                                No unproductive apps
                                                            </div>
                                                        ) : (
                                                            user.unproductiveApps.map((app: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className={`px-5 py-2.5 group relative hover:bg-gray-50 transition-all duration-700 ${movingApp?.name === app.name
                                                                        ? "opacity-50 scale-[0.98] bg-green-50"
                                                                        : "opacity-100 scale-100"
                                                                        }`}
                                                                    title={`${app.name} - ${app.time}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                                                            <FaDesktop className="w-5 h-5 rounded" />
                                                                        </div>

                                                                        <div className="flex-1 min-w-0 text-sm">
                                                                            <div
                                                                                className={`truncate transition-all duration-500 ${movingApp?.name === app.name
                                                                                    ? "line-through text-gray-400"
                                                                                    : ""
                                                                                    }`}
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {app.name}
                                                                                </span>

                                                                                <span className="text-gray-500">
                                                                                    {" - "}
                                                                                    {app.time}
                                                                                </span>
                                                                            </div>

                                                                            {movingApp?.name === app.name && (
                                                                                <div className="mt-1 flex items-center gap-2">
                                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                                                        → Moved to {movingApp?.target}
                                                                                    </span>

                                                                                    <Check className="w-4 h-4 text-green-500" />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {renderMenu(user, app, "unproductive")}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

            <ReportsModal
                open={reportsOpen}
                onClose={() => setReportsOpen(false)}
                onGenerate={onGenerateReport}
                autoGenerate
            />
        </>
    )
}

export default ProductivityCard
