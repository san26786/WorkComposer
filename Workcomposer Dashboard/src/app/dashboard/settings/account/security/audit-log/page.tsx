"use client"

import { useState, Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import { HiOutlineCalendar } from "react-icons/hi";
import {
    HiOutlineUsers,
    HiOutlineCog6Tooth,
    HiOutlineFolder,
    HiOutlineDevicePhoneMobile,
    HiOutlineBuildingOffice,
} from "react-icons/hi2";

import { FaTasks } from "react-icons/fa";
import API from "@/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SettingsLoading from "@/components/settings/SettingsLoading";
import toast from "react-hot-toast";

export default function AuditLogPage() {

    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date(),
    });

    const [users, setUsers] = useState<any[]>([]);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const userDropdownRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(e.target as Node)
            ) {
                setUserOpen(false);
            }

            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(e.target as Node)
            ) {
                setCategoryOpen(false);
            }

            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(e.target as Node)
            ) {
                setDatePickerOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/auditLog", {
                params: {
                    page: currentPage,
                    limit: 10,
                    user: selectedUser,
                    category: selectedCategory,
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString(),
                },
            });

            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setTotalLogs(data.total);
        } catch (err: any) {
            console.error("AUDIT LOG FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load audit logs."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, [
        currentPage,
        selectedUser,
        selectedCategory,
        dateRange,
    ]);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await API.get("/users");

                setUsers(data);
            } catch (err: any) {
                console.error("AUDIT LOG USERS FETCH ERROR:", err);

                toast.error(
                    err.response?.data?.message ||
                    "Failed to load users."
                );
            }
        };

        fetchUsers();
    }, []);


    const selectedUserData =
        users.find((u: any) => u._id === selectedUser) || null;


    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "Users":
                return "bg-blue-100 text-blue-700";

            case "Settings":
                return "bg-gray-100 text-gray-700";

            case "Devices":
                return "bg-red-100 text-red-700";

            case "Desktop App":
                return "bg-purple-100 text-purple-700";

            case "Teams":
                return "bg-green-100 text-green-700";

            case "Projects":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Users":
                return "👤";

            case "Teams":
                return "👥";

            case "Roles":
                return "🎭";

            case "Desktop App":
                return "💻";

            case "Organization":
                return "🏢";

            case "Settings":
                return "⚙️";

            case "Billing":
                return "💳";

            case "Storage":
                return "☁️";

            case "Projects":
                return "📁";

            case "Tasks":
                return "✅";

            case "HR Leave Types":
                return "🏖️";

            case "Devices":
                return "🔒";

            default:
                return "📄";
        }
    };

    const getAvatarUrl = (avatar?: string) => {
        if (!avatar) return "/default-avatar.png";

        return `${process.env.NEXT_PUBLIC_API_URL}/${avatar}`;
    };

    return (
        <>
            <div>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                    <div className='mb-6'>
                        <h2 className='text-2xl font-bold text-gray-900'>Audit Log</h2>
                        <p className='text-sm text-gray-600 mt-1'>Track security-related activities in your workspace</p>
                    </div>

                    <div className='mb-6 flex flex-wrap gap-3'>
                        <div>
                            <button
                                type="button"
                                onClick={() => setDatePickerOpen(!datePickerOpen)}
                                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:border-gray-300"
                            >
                                <div className='flex items-center gap-2'>
                                    <HiOutlineCalendar className="w-4 h-4 text-wc-text-3" />
                                    <span>
                                        {dateRange.start.toLocaleDateString()} -{" "}
                                        {dateRange.end.toLocaleDateString()}
                                    </span>
                                </div>
                            </button>
                        </div>
                        {datePickerOpen && (
                            <div className="absolute z-30 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">

                                <div className="flex gap-4">

                                    <div
                                        ref={datePickerRef}
                                        className="relative"
                                    >
                                        <label className="mb-2 block text-sm font-medium">
                                            Start Date
                                        </label>

                                        <DatePicker
                                            selected={dateRange.start}
                                            onChange={(date: Date | null) =>
                                                setDateRange((prev) => ({
                                                    ...prev,
                                                    start: date || prev.start,
                                                }))
                                            }
                                            selectsStart
                                            startDate={dateRange.start}
                                            endDate={dateRange.end}
                                            className="rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>

                                    <div ref={datePickerRef}
                                        className="relative">
                                        <label className="mb-2 block text-sm font-medium">
                                            End Date
                                        </label>

                                        <DatePicker
                                            selected={dateRange.end}
                                            onChange={(date: Date | null) =>
                                                setDateRange((prev) => ({
                                                    ...prev,
                                                    end: date || prev.end,
                                                }))
                                            }
                                            selectsEnd
                                            startDate={dateRange.start}
                                            endDate={dateRange.end}
                                            minDate={dateRange.start}
                                            className="rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>

                                </div>

                                <div className="mt-4 flex justify-end gap-2">

                                    <button
                                        onClick={() => setDatePickerOpen(false)}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm"
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>
                        )}

                        <div
                            ref={userDropdownRef}
                            className="relative">
                            <button
                                type="button"
                                onClick={() => setUserOpen(!userOpen)}
                                className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm hover:border-gray-400"
                            >
                                <span className="block truncate">
                                    {selectedUserData
                                        ? `${selectedUserData.firstName} ${selectedUserData.lastName}`
                                        : "All Users"}
                                </span>
                            </button>

                            {userOpen && (
                                <div className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">

                                    <button
                                        onClick={() => {
                                            setSelectedUser("all");
                                            setUserOpen(false);
                                        }}
                                        className="block w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
                                    >
                                        All Users
                                    </button>

                                    {users.map((user: any) => (
                                        <button
                                            key={user._id}
                                            onClick={() => {
                                                setSelectedUser(user._id);
                                                setUserOpen(false);
                                            }}
                                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-100"
                                        >
                                            <Image
                                                src={getAvatarUrl(user.avatar)}
                                                width={32}
                                                height={32}
                                                className="rounded-full object-cover"
                                                alt={`${user.firstName} ${user.lastName}`}
                                            />

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </p>

                                                <p className="text-xs capitalize text-gray-500">
                                                    {user.role}
                                                </p>
                                            </div>
                                        </button>
                                    ))}

                                </div>
                            )}
                        </div>

                        <div
                            ref={categoryDropdownRef}
                            className="relative">
                            <button
                                type="button"
                                onClick={() => setCategoryOpen(!categoryOpen)}
                                aria-expanded={categoryOpen}
                                className="w-52 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm hover:border-gray-400"
                            >
                                <span className="block truncate">
                                    {selectedCategory === "all"
                                        ? "All Categories"
                                        : selectedCategory}
                                </span>
                            </button>

                            {categoryOpen && (
                                <div className="absolute z-20 mt-1 max-h-96 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">

                                    {/* All Categories */}

                                    <button
                                        onClick={() => {
                                            setSelectedCategory("all");
                                            setCategoryOpen(false);
                                        }}
                                        className="block w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
                                    >
                                        All Categories
                                    </button>

                                    <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                                        Account & Access
                                    </div>

                                    {[
                                        "Users",
                                        "Teams",
                                        "Roles",
                                        "Desktop App",
                                    ].map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setCategoryOpen(false);
                                            }}
                                            className="block w-full px-6 py-2 text-left text-sm hover:bg-gray-100"
                                        >
                                            {category === "Users" && "👤 "}
                                            {category === "Teams" && "👥 "}
                                            {category === "Roles" && "🎭 "}
                                            {category === "Desktop App" && "💻 "}
                                            {category}
                                        </button>
                                    ))}

                                    <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                                        Organization & Settings
                                    </div>

                                    {[
                                        "Organization",
                                        "Settings",
                                        "Billing",
                                        "Storage",
                                    ].map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setCategoryOpen(false);
                                            }}
                                            className="block w-full px-6 py-2 text-left text-sm hover:bg-gray-100"
                                        >
                                            {category === "Organization" && "🏢 "}
                                            {category === "Settings" && "⚙️ "}
                                            {category === "Billing" && "💳 "}
                                            {category === "Storage" && "☁️ "}
                                            {category}
                                        </button>
                                    ))}

                                    <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                                        Projects & HR
                                    </div>

                                    {[
                                        "Projects",
                                        "Tasks",
                                        "HR Leave Types",
                                    ].map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setCategoryOpen(false);
                                            }}
                                            className="block w-full px-6 py-2 text-left text-sm hover:bg-gray-100"
                                        >
                                            {category === "Projects" && "📁 "}
                                            {category === "Tasks" && "✅ "}
                                            {category === "HR Leave Types" && "🏖️ "}
                                            {category}
                                        </button>
                                    ))}

                                    <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                                        Devices
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedCategory("Devices");
                                            setCategoryOpen(false);
                                        }}
                                        className="block w-full px-6 py-2 text-left text-sm hover:bg-gray-100"
                                    >
                                        🔒 Devices
                                    </button>

                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setSelectedUser("all");
                                setSelectedCategory("all");
                                setDateRange({
                                    start: new Date(new Date().setDate(new Date().getDate() - 30)),
                                    end: new Date(),
                                });
                            }}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            Clear Filters
                        </button>

                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-900">Activity Log</h3>
                                <div className="text-sm text-gray-600">{logs.length === 0
                                    ? "0 Results"
                                    : `${(currentPage - 1) * 10 + 1}-${Math.min(
                                        currentPage * 10,
                                        totalLogs
                                    )} of ${totalLogs}`}</div>
                            </div>
                        </div>
                        <div>
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Performed By</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Activity</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Details</th>
                                    </tr>
                                </thead>

                                {loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={4} className="p-0">
                                                <SettingsLoading />
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody className="divide-y divide-gray-100">

                                        {logs.map((log) => (
                                            <Fragment key={log._id}>

                                                {/* Main Row */}

                                                <tr className="hover:bg-gray-50">

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center">
                                                            <Image
                                                                src={getAvatarUrl(log.performedBy?.avatar)}
                                                                width={32}
                                                                height={32}
                                                                className="rounded-full"
                                                                alt={`${log.performedBy?.firstName ?? "User"} ${log.performedBy?.lastName ?? ""}`.trim()}
                                                                unoptimized
                                                            />

                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {log.performedBy?.firstName} {log.performedBy?.lastName}
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    {log.performedBy?._id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">

                                                        <div className="flex flex-col gap-1">

                                                            <span
                                                                className={`inline-flex w-fit rounded-full gap-1 px-2 py-1 text-xs font-medium ${getCategoryBadge(
                                                                    log.category
                                                                )}`}
                                                            >
                                                                <>
                                                                    <span>{getCategoryIcon(log.category)}</span>

                                                                    <span>{log.category}</span>
                                                                </>
                                                            </span>

                                                            <span className="text-sm text-gray-900">
                                                                {log.activity}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                        {new Date(log.createdAt).toLocaleString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </td>

                                                    <td className="px-4 py-3">

                                                        <button
                                                            onClick={() =>
                                                                setExpandedLog(
                                                                    expandedLog === log._id
                                                                        ? null
                                                                        : log._id
                                                                )
                                                            }
                                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            {expandedLog === log._id
                                                                ? "Hide"
                                                                : "Show"}
                                                        </button>

                                                    </td>

                                                </tr>

                                                {/* Expanded Row */}

                                                {expandedLog === log._id && (

                                                    <tr className="bg-gray-50">

                                                        <td
                                                            colSpan={4}
                                                            className="px-4 py-3"
                                                        >

                                                            <div className="rounded-lg border border-gray-200 bg-white p-4">

                                                                <div className="space-y-2 text-sm">

                                                                    {Object.entries(log.details || {}).map(([key, value]) => (

                                                                        <div
                                                                            key={key}
                                                                            className="flex gap-2"
                                                                        >

                                                                            <span className="min-w-[140px] capitalize text-gray-500">
                                                                                {key.replace(/([A-Z])/g, " $1")}:
                                                                            </span>

                                                                            <div className="font-medium text-gray-900">

                                                                                {typeof value === "object" && value !== null ? (

                                                                                    <div className="space-y-1">

                                                                                        {Object.entries(value as Record<string, any>).map(
                                                                                            ([subKey, subValue]) => (

                                                                                                <div
                                                                                                    key={subKey}
                                                                                                    className="flex gap-2"
                                                                                                >
                                                                                                    <span className="capitalize text-gray-500">
                                                                                                        {subKey}:
                                                                                                    </span>

                                                                                                    <span>
                                                                                                        {String(subValue)}
                                                                                                    </span>

                                                                                                </div>

                                                                                            )
                                                                                        )}

                                                                                    </div>

                                                                                ) : (

                                                                                    String(value)

                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                    ))}

                                                                    <div className="flex gap-2">
                                                                        <span className="min-w-[140px] text-gray-500">
                                                                            IP Address:
                                                                        </span>

                                                                        <span className="font-medium">
                                                                            {log.ipAddress}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex gap-2">
                                                                        <span className="min-w-[140px] text-gray-500">
                                                                            Platform:
                                                                        </span>

                                                                        <span className="font-medium">
                                                                            {log.platform}
                                                                        </span>
                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )}

                                            </Fragment>
                                        ))}
                                    </tbody>
                                )}
                            </table>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">

                                    <p className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </p>

                                    <div className="flex gap-2">

                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((p) => p - 1)}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((p) => p + 1)}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                        </button>

                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

