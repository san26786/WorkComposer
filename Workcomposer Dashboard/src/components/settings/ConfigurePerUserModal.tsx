"use client";

import { useEffect, useRef, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import { HiOutlineUsers } from "react-icons/hi2";
import { LiaSlidersHSolid } from "react-icons/lia";
import { Star } from 'lucide-react';
import CustomSelect from "@/app/dashboard/settings/time-tracking/tracking/components/CustomSelect";
import TimeSettingRow from "@/app/dashboard/settings/time-tracking/email-reports/components/TimeSettingRow";
import WeekdaySettingRow from "@/app/dashboard/settings/time-tracking/email-reports/components/WeekdaySettingRow";
import NumberSettingRow from "@/app/dashboard/settings/time-tracking/email-reports/components/NumberSettingRow";
import SelectSettingRow from "@/app/dashboard/settings/time-tracking/email-reports/components/SelectSettingRow";
import ToggleSettingRow from "@/app/dashboard/settings/time-tracking/email-reports/components/ToggleSettingRow";


type Option = {
    label: string;
    value: string | number;
};

type AdvancedField = {
    key: string;
    label: string;
    organizationSetting: any;

    type?: "select" | "number" | "time" | "weekdays" | "toggle";

    options?: Option[];
};

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;

    module:
    | "appUpdate"
    | "tracking"
    | "screenCapture"
    | "manualTime"
    | "shift"
    | "emailReports"
    | "notifications";

    settingKey: string;

    organizationSetting: any;

    options?: Option[];
    advancedFields?: AdvancedField[];
};

export default function ConfigurePerUserModal({
    open,
    onClose,
    title,
    module,
    settingKey,
    organizationSetting,
    options,
    advancedFields,
}: Props) {

    const safeOptions = options ?? [];

    const safeAdvancedFields = advancedFields ?? [];

    const isSelectMode = safeOptions.length > 0;

    const isTimeMode = settingKey === "dailyMinimumTime";

    const isWeekdayMode = settingKey === "dailyWeekDays";

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
        emailReportSettings?: Record<string, any>;
        shiftSettings?: Record<string, any>;
        notificationSettings?: Record<string, any>;
    };

    const [users, setUsers] = useState<User[]>([]);

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [search, setSearch] = useState("");


    const [filter, setFilter] = useState<
        "all" | "custom" | "default"
    >("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const USERS_PER_PAGE = 10;

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


    useEffect(() => {
        if (!open) return;

        const fetchUsers = async () => {
            try {
                const { data } = await API.get("/users");

                setUsers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [open]);

    const settingsField:
        | "appUpdateSettings"
        | "trackingSettings"
        | "screenCaptureSettings"
        | "manualTimeSettings"
        | "shiftSettings"
        | "emailReportSettings"
        | "notificationSettings" =
        module === "appUpdate"
            ? "appUpdateSettings"
            : module === "tracking"
                ? "trackingSettings"
                : module === "screenCapture"
                    ? "screenCaptureSettings"
                    : module === "manualTime"
                        ? "manualTimeSettings"
                        : module === "shift"
                            ? "shiftSettings"
                            : module === "emailReports"
                                ? "emailReportSettings"
                                : "notificationSettings";

    const weekDays = [
        { label: "Sun", value: 0 },
        { label: "Mon", value: 1 },
        { label: "Tue", value: 2 },
        { label: "Wed", value: 3 },
        { label: "Thu", value: 4 },
        { label: "Fri", value: 5 },
        { label: "Sat", value: 6 },
    ];

    const getEffectiveSetting = (user: any) => {
        const override = user[settingsField]?.[settingKey];

        if (override === null || override === undefined) {
            return organizationSetting;
        }

        return override;
    };

    const getAdvancedFieldValue = (
        user: any,
        field: AdvancedField
    ) => {
        const override = user[settingsField]?.[field.key];

        if (override === null || override === undefined) {
            return field.organizationSetting;
        }

        return override;
    };

    const filteredUsers = users
        .filter((user: any) => {
            if (selectedUser) {
                return user._id === selectedUser._id;
            }

            return `${user.firstName} ${user.lastName}`
                .toLowerCase()
                .includes(search.toLowerCase());
        })
        .filter((user: any) => {
            const effectiveSetting = getEffectiveSetting(user);

            if (filter === "custom") {
                return effectiveSetting !== organizationSetting;
            }

            if (filter === "default") {
                return effectiveSetting === organizationSetting;
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

    const handleUserToggle = async (
        userId: string,
        value: any,
        key: string = settingKey
    ) => {

        // Save previous users in case request fails
        const previousUsers = users;

        // Update UI immediately
        setUsers((prev) =>
            prev.map((user) => {

                if (user._id !== userId) {
                    return user;
                }

                return {
                    ...user,
                    [settingsField]: {
                        ...user[settingsField],
                        [key]: value,
                    },
                };
            })
        );

        try {
            const { data } = await API.put(
                `/users/${userId}/configure-setting`,
                {
                    module,
                    setting: key,
                    value,
                }
            );

            // Sync with backend response
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === userId
                        ? {
                            ...user,
                            [settingsField]: data.settings[module],
                        }
                        : user
                )
            );

            toast.success("User setting updated.");

        } catch (err: any) {

            console.error("CONFIGURE PER USER ERROR:", err);

            // Roll back if request fails
            setUsers(previousUsers);

            toast.error(
                err.response?.data?.message ||
                "Failed to update user setting."
            );

        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedUser(null);
        setDropdownOpen(false);
        setFilter("all");
        setCurrentPage(1);
    };

    const dropdownUsers = users.filter((user: any) =>
        `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const hasActiveFilters =
        search.trim() !== "" || filter !== "all";

    useEffect(() => {
        if (!open) return;

        clearFilters();
        setLoadingUsers(true);
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl rounded-2xl bg-white shadow-xl"
            >

                {/* Header */}
                <div className="rounded-t-xl bg-gray-100 mt-6 px-10 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Configure this setting for individual users in your organization.
                    </p>
                </div>

                {/* Body */}
                <div className="h-[500px] overflow-y-auto p-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
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

                        <div className="mt-5 flex items-center justify-between">
                            <div className="flex gap-3">

                                {/* All Users */}

                                <button
                                    onClick={() => {
                                        setFilter("all");
                                        setCurrentPage(1);
                                    }}
                                    className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition ${filter === "all"
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                >
                                    <HiOutlineUsers className="mr-2 h-4 w-4" />
                                    All Users
                                </button>

                                {/* Custom */}

                                <button
                                    onClick={() => {
                                        setFilter("custom");
                                        setCurrentPage(1);
                                    }}
                                    className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition ${filter === "custom"
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                >
                                    <LiaSlidersHSolid className="mr-2 h-4 w-4" />
                                    Custom Settings
                                </button>

                                {/* Default */}

                                <button
                                    onClick={() => {
                                        setFilter("default");
                                        setCurrentPage(1);
                                    }}
                                    className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition ${filter === "default"
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                >
                                    <Star className="mr-2 h-4 w-4" />
                                    Default Settings
                                </button>

                                {/* Clear */}

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
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

                        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">

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
                                        className="mt-4 rounded-md text-sm bg-indigo-50 px-3 py-2 font-medium text-indigo-600 hover:bg-indigo-100"
                                    >
                                        Clear Filters
                                    </button>

                                </div>

                            ) : (

                                paginatedUsers.map((user: any) => {
                                    const effectiveSetting = getEffectiveSetting(user);

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between border-b border-gray-100 px-6 py-4 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
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
                                                    <p className="font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                    </p>

                                                    <p className="text-xs text-gray-500 capitalize">
                                                        {user.role}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">

                                                {isSelectMode ? (

                                                    <CustomSelect
                                                        width="w-56"
                                                        value={effectiveSetting}
                                                        options={safeOptions}
                                                        onChange={(value) =>
                                                            handleUserToggle(user._id, value)
                                                        }
                                                    />

                                                ) : isTimeMode ? (
                                                    <TimeSettingRow
                                                        hours={effectiveSetting?.hours ?? 0}
                                                        minutes={effectiveSetting?.minutes ?? 0}
                                                        onHoursChange={(value) =>
                                                            handleUserToggle(user._id, {
                                                                ...effectiveSetting,
                                                                hours: value,
                                                            })
                                                        }
                                                        onMinutesChange={(value) =>
                                                            handleUserToggle(user._id, {
                                                                ...effectiveSetting,
                                                                minutes: value,
                                                            })
                                                        }
                                                    />

                                                ) : isWeekdayMode ? (

                                                    <WeekdaySettingRow
                                                        value={effectiveSetting ?? []}
                                                        onToggle={(updated) => {
                                                            handleUserToggle(user._id, updated);
                                                        }}
                                                    />
                                                ) : (

                                                    <div className="flex flex-col items-end gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUserToggle(
                                                                        user._id,
                                                                        !effectiveSetting
                                                                    )
                                                                }
                                                                className={`relative h-7 w-14 rounded-full transition-colors ${effectiveSetting
                                                                    ? "bg-indigo-600"
                                                                    : "bg-gray-300"
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${effectiveSetting
                                                                        ? "left-8"
                                                                        : "left-1"
                                                                        }`}
                                                                />
                                                            </button>

                                                            <span className="w-8 text-sm text-gray-600">
                                                                {effectiveSetting ? "On" : "Off"}
                                                            </span>
                                                        </div>


                                                        {false &&
                                                            safeAdvancedFields.length > 0 &&
                                                            effectiveSetting && (
                                                                <div className="flex gap-3">
                                                                    {safeAdvancedFields.map((field) => (
                                                                        <div
                                                                            key={field.key}
                                                                            className="flex items-center justify-between gap-8"
                                                                        >
                                                                            <label className="text-sm font-medium text-gray-700">
                                                                                {field.label}
                                                                            </label>

                                                                            {field.type === "toggle" ? (
                                                                                <ToggleSettingRow
                                                                                    checked={getAdvancedFieldValue(user, field)}
                                                                                    onChange={() =>
                                                                                        handleUserToggle(
                                                                                            user._id,
                                                                                            !getAdvancedFieldValue(user, field),
                                                                                            field.key
                                                                                        )
                                                                                    }
                                                                                />
                                                                            ) : field.type === "time" ? (
                                                                                <TimeSettingRow
                                                                                    hours={getAdvancedFieldValue(user, field)?.hours ?? 0}
                                                                                    minutes={getAdvancedFieldValue(user, field)?.minutes ?? 0}
                                                                                    onHoursChange={(value) =>
                                                                                        handleUserToggle(
                                                                                            user._id,
                                                                                            {
                                                                                                ...getAdvancedFieldValue(user, field),
                                                                                                hours: value,
                                                                                            },
                                                                                            field.key
                                                                                        )
                                                                                    }
                                                                                    onMinutesChange={(value) =>
                                                                                        handleUserToggle(
                                                                                            user._id,
                                                                                            {
                                                                                                ...getAdvancedFieldValue(user, field),
                                                                                                minutes: value,
                                                                                            },
                                                                                            field.key
                                                                                        )
                                                                                    }
                                                                                />
                                                                            ) : field.type === "weekdays" ? (
                                                                                <WeekdaySettingRow
                                                                                    value={getAdvancedFieldValue(user, field) ?? []}
                                                                                    onToggle={(updated) =>
                                                                                        handleUserToggle(
                                                                                            user._id,
                                                                                            updated,
                                                                                            field.key
                                                                                        )
                                                                                    }
                                                                                />
                                                                            ) : field.type === "number" ? (
                                                                                <NumberSettingRow
                                                                                    value={getAdvancedFieldValue(user, field) ?? ""}
                                                                                    onChange={(value) =>
                                                                                        handleUserToggle(
                                                                                            user._id,
                                                                                            value,
                                                                                            field.key
                                                                                        )
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <SelectSettingRow
                                                                                    value={getAdvancedFieldValue(user, field)}
                                                                                    options={field.options ?? []}
                                                                                    onChange={(value) =>
                                                                                        handleUserToggle(
                                                                                            user._id,
                                                                                            value,
                                                                                            field.key
                                                                                        )
                                                                                    }
                                                                                />
                                                                            )
                                                                            }
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                    </div>

                                                )}

                                            </div>
                                        </div>
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
                                        onClick={() =>
                                            setCurrentPage((p) => p - 1)
                                        }
                                        className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <span className="px-3 py-1 text-sm">
                                        {currentPage} / {totalPages}
                                    </span>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage((p) => p + 1)
                                        }
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
                <div className="flex justify-end rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-md bg-indigo-50 px-5 py-2 text-indigo-600 hover:bg-indigo-100"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}