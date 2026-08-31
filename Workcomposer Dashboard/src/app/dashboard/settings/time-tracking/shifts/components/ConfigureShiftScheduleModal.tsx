"use client";

import { HiOutlineUsers } from "react-icons/hi2";
import UserShiftCard from "./UserShiftCard";
import { useEffect, useState, useRef } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import ConfigureUserShiftModal from "./ConfigureUserShiftModal";

type Props = {
    open: boolean;
    onClose: () => void;
    organizationSchedule: any[];
    organizationAutoStartTracking: boolean;
    organizationAutoStopTracking: boolean;
};
export default function ConfigureShiftScheduleModal({
    open,
    onClose,
    organizationSchedule,
    organizationAutoStartTracking,
    organizationAutoStopTracking,
}: Props) {

    type User = {
        _id: string;
        firstName: string;
        lastName: string;
        avatar: string;
        role: string;

        appUpdateSettings?: Record<string, any>;
        trackingSettings?: Record<string, any>;
        screenCaptureSettings?: {
            enabled?: boolean | null;
            screenshotFrequency?: number | null;
            blurScreenshots?:
            | "disabled"
            | "slightly_blurred"
            | "maximum_blurring"
            | null;
        };
        manualTimeSettings?: Record<string, any>;
        shiftSettings?: Record<string, any>;
    };

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [configureModalOpen, setConfigureModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "custom" | "default">("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const USERS_PER_PAGE = 10;

    const hasCustomShiftSettings = (
        userSchedule: any,
        organizationSchedule: any[],
    ) => {
        if (userSchedule == null) {
            return false;
        }

        return (
            JSON.stringify(userSchedule) !==
            JSON.stringify(organizationSchedule)
        );
    };;

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);

            const { data } = await API.get("/users");

            setUsers(data);
        } catch (error: any) {
            console.error("SHIFT USERS FETCH ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoadingUsers(false);
        }
    };;

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    useEffect(() => {
        if (!open) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const dropdownUsers = users.filter((user) =>
        `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    const filteredUsers = users
        .filter((user) =>
            `${user.firstName} ${user.lastName}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .filter((user) => {
            const hasCustomSchedule = hasCustomShiftSettings(
                user.shiftSettings?.schedule,
                organizationSchedule,
            );

            if (filter === "custom") {
                return hasCustomSchedule;
            }

            if (filter === "default") {
                return !hasCustomSchedule;
            }

            return true;
        });

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / USERS_PER_PAGE)
    );

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
    );

    const clearFilters = () => {
        setSearch("");
        setSelectedUser(null);
        setDropdownOpen(false);
        setFilter("all");
        setCurrentPage(1);
    };

    const hasActiveFilters =
        search.trim() !== "" || filter !== "all";

    const customSettingsCount = users.filter((user) =>
        hasCustomShiftSettings(
            user.shiftSettings?.schedule,
            organizationSchedule,
        )
    ).length;


    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="flex h-[92vh] w-[900px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">

                    {/* Header */}
                    <div className="flex items-start justify-between bg-gray-200 border-b px-8 py-6">

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Configure Shift Settings Per User
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Configure shift schedules for individual users in your organization.
                            </p>
                        </div>

                        <div className="rounded-full bg-indigo-100 px-4 py-2 text-xs font-bold text-indigo-700">
                            {customSettingsCount} user{customSettingsCount !== 1 ? "s" : ""} with custom settings
                        </div>

                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">

                        <div className="space-y-6">

                            {/* Search */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Search Users
                                </label>

                                <div
                                    ref={dropdownRef}
                                    className="relative"
                                >

                                    <input
                                        type="text"
                                        value={search}
                                        onFocus={() => setDropdownOpen(true)}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setSelectedUser(null);
                                            setDropdownOpen(true);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Search by name or select from dropdown..."
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                    />

                                    {dropdownOpen && (
                                        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">

                                            {dropdownUsers.map((user: any) => (
                                                <button
                                                    key={user._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedUser(user);

                                                        setSearch(
                                                            `${user.firstName} ${user.lastName}`
                                                        );

                                                        setDropdownOpen(false);

                                                        setCurrentPage(1);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                                                >
                                                    {user?.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={`${user.firstName} ${user.lastName}`}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                                                            {`${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </p>

                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {user.role}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}

                                            {dropdownUsers.length === 0 && (
                                                <div className="px-4 py-6 text-center text-sm text-gray-500">
                                                    No users found
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="mt-3 mb-3 flex items-center justify-between">

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setFilter("all");
                                                setCurrentPage(1);
                                            }}
                                            className={`rounded-lg px-6 py-2 text-sm font-medium transition ${filter === "all"
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            All Users
                                        </button>

                                        <button
                                            onClick={() => {
                                                setFilter("custom");
                                                setCurrentPage(1);
                                            }}
                                            className={`rounded-lg px-6 py-2 text-sm font-medium transition ${filter === "custom"
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            Custom Settings
                                        </button>

                                        <button
                                            onClick={() => {
                                                setFilter("default");
                                                setCurrentPage(1);
                                            }}
                                            className={`rounded-lg px-6 py-2 text-sm font-medium transition ${filter === "default"
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            Default Settings
                                        </button>

                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                            >
                                                ✕
                                                <span className="ml-2">
                                                    Clear Filters
                                                </span>
                                            </button>
                                        )}

                                    </div>

                                    {filter !== "all" && (
                                        <p className="text-sm text-gray-600">
                                            Filtered by:{" "}
                                            <span className="font-semibold text-indigo-600">
                                                {filter === "custom"
                                                    ? "Custom Settings"
                                                    : "Default Settings"}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Users List */}

                                <div className="overflow-hidden rounded-xl border border-gray-200">

                                    {loadingUsers ? (
                                        <div className="p-8 text-center text-gray-500">
                                            Loading users...
                                        </div>
                                    ) : filteredUsers.length === 0 ? (

                                        <div className="flex h-[320px] flex-col items-center justify-center">

                                            <HiOutlineUsers className="h-12 w-12 text-gray-600" />

                                            <h3 className="mt-2 text-md font-semibold text-gray-900">
                                                No users found
                                            </h3>

                                            <p className="mt-1 text-center text-sm text-gray-500">
                                                Try adjusting your search or clear filters.
                                            </p>

                                            <button
                                                onClick={clearFilters}
                                                className="mt-4 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
                                            >
                                                Clear Filters
                                            </button>

                                        </div>

                                    ) : (
                                        paginatedUsers.map((user) => {

                                            return (
                                                <UserShiftCard
                                                    key={user._id}
                                                    user={user}
                                                    schedule={
                                                        Array.isArray(user.shiftSettings?.schedule)
                                                            ? organizationSchedule.map((orgDay: any) => {
                                                                const userDay = user.shiftSettings?.schedule?.find(
                                                                    (d: any) => d.day === orgDay.day
                                                                );

                                                                return userDay || orgDay;
                                                            })
                                                            : organizationSchedule
                                                    }
                                                    hasCustomSettings={hasCustomShiftSettings(
                                                        user.shiftSettings?.schedule,
                                                        organizationSchedule,
                                                    )}
                                                    onConfigure={() => {
                                                        setSelectedUser(user);
                                                        setConfigureModalOpen(true);
                                                    }}
                                                    onReset={async () => {
                                                        try {
                                                            await API.patch(`/users/${user._id}/shift-settings`, {
                                                                schedule: null,
                                                            });

                                                            toast.success("User shift settings reset.");

                                                            await fetchUsers();
                                                        } catch (error: any) {
                                                            console.error("RESET USER SHIFT SETTINGS ERROR:", error);

                                                            toast.error(
                                                                error.response?.data?.message ||
                                                                "Failed to reset user shift settings."
                                                            );
                                                        }
                                                    }}
                                                />
                                            );
                                        })
                                    )}

                                </div>

                                {filteredUsers.length > USERS_PER_PAGE && (
                                    <div className="mt-4 flex items-center justify-between">

                                        <p className="text-sm text-gray-500">
                                            Showing{" "}
                                            {(currentPage - 1) * USERS_PER_PAGE + 1}
                                            -
                                            {Math.min(
                                                currentPage * USERS_PER_PAGE,
                                                filteredUsers.length
                                            )}{" "}
                                            of {filteredUsers.length}
                                        </p>

                                        <div className="flex gap-2">

                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((p) => p - 1)}
                                                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                                            >
                                                Previous
                                            </button>

                                            <span className="px-3 py-1 text-sm">
                                                {currentPage} / {totalPages}
                                            </span>

                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage((p) => p + 1)}
                                                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                                            >
                                                Next
                                            </button>

                                        </div>

                                    </div>
                                )}



                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end border-t px-8 py-5">

                            <button
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-indigo-700 font-semibold hover:bg-gray-50"
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            </div>

            <ConfigureUserShiftModal
                open={configureModalOpen}
                onClose={() => setConfigureModalOpen(false)}
                user={selectedUser}
                organizationSchedule={organizationSchedule}
                onSaved={() => fetchUsers()}
            />
        </>
    );
}