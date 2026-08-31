"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import ConfigurePerUserModal from "@/components/settings/ConfigurePerUserModal";
import SettingGroup from "./components/SettingGroup";
import GroupRow from "./components/GroupRow";
import SettingsLoading from "@/components/settings/SettingsLoading";

export default function EmailReportsPage() {
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState({
        // Tracking reports
        weeklyTrackingReports: false,
        dailyTrackingReports: false,

        // Daily warning emails
        dailyWarningEmails: false,
        dailyBasedOnShift: true,
        dailyMinimumTime: {
            hours: 4,
            minutes: 0,
        },
        dailyWeekDays: [1, 2, 3, 4, 5],

        // Weekly warning emails
        weeklyWarningEmails: false,
        weeklyBasedOnShift: true,
        weeklyMinimumTime: {
            hours: 4,
            minutes: 0,
        },

        // Idle percentage
        idlePercentageEnabled: false,
        idlePercentage: 30,
    });
    const [configureOpen, setConfigureOpen] = useState(false);

    const [selectedSetting, setSelectedSetting] = useState<{
        key: string;
        label: string;
    } | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/organization/email-reports");
            setSettings(data);
        } catch (err: any) {
            console.error("EMAIL REPORT SETTINGS FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load email report settings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);


    const updateSetting = async (
        setting: string,
        value: any
    ) => {
        try {
            await API.put("/organization/email-reports", {
                setting,
                value,
            });

            setSettings((prev) => ({
                ...prev,
                [setting]: value,
            }));
            toast.success("Settings updated successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update settings");
        }
    };

    type ToggleRowProps = {
        title: string;
        description?: string;
        checked: boolean;
        onToggle: () => void;
        showConfigure?: boolean;
        onConfigure?: () => void;
    };

    const ToggleRow = ({
        title,
        description,
        checked,
        onToggle,
        showConfigure = false,
        onConfigure,
    }: ToggleRowProps) => (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex-1">
                    <h3 className="text-[17px] font-medium text-gray-900">
                        {title}
                    </h3>

                    {description && (
                        <p className="mt-1 text-sm text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6 lg:justify-end lg:gap-8">

                    {showConfigure && (
                        <button
                            onClick={onConfigure}
                            className="whitespace-nowrap text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Configure per user
                        </button>
                    )}

                    <div className="flex flex-wrap items-center gap-3">

                        <button
                            onClick={onToggle}
                            className={`relative h-7 w-14 rounded-full transition ${checked
                                ? "bg-indigo-600"
                                : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked
                                    ? "left-8"
                                    : "left-1"
                                    }`}
                            />
                        </button>

                        <span
                            className={`text-sm font-medium ${checked
                                ? "text-indigo-600"
                                : "text-gray-500"
                                }`}
                        >
                            {checked ? "On" : "Off"}
                        </span>

                    </div>

                </div>

            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-8 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-8">
                <SettingsLoading />
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto w-full max-w-6xl px-4 py-8 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-8">
                <h1 className="text-2xl font-semibold leading-none text-gray-900 sm:text-[25px]">
                    Email Reports
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 sm:text-[15px]">
                    Configure tracking reports and warning emails for your organization.
                </p>

                <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <ToggleRow
                        title="Receive weekly tracking reports"
                        description="Send weekly productivity and tracking reports."
                        checked={settings.weeklyTrackingReports}
                        onToggle={() =>
                            updateSetting(
                                "weeklyTrackingReports",
                                !settings.weeklyTrackingReports
                            )
                        }
                    />

                    <ToggleRow
                        title="Receive daily tracking reports"
                        description="Send daily productivity and tracking reports."
                        checked={settings.dailyTrackingReports}
                        onToggle={() =>
                            updateSetting(
                                "dailyTrackingReports",
                                !settings.dailyTrackingReports
                            )
                        }
                    />

                    <>
                        <ToggleRow
                            title="Send daily warning emails"
                            description="Notify users daily when they exceed the idle threshold."
                            checked={settings.dailyWarningEmails}
                            onToggle={() =>
                                updateSetting(
                                    "dailyWarningEmails",
                                    !settings.dailyWarningEmails
                                )
                            }
                            showConfigure
                            onConfigure={() => {
                                setSelectedSetting({
                                    key: "dailyWarningEmails",
                                    label: "Send daily warning emails",
                                });

                                setConfigureOpen(true);
                            }}
                        />

                        {settings.dailyWarningEmails && (
                            <SettingGroup>

                                <GroupRow
                                    title="Based on shift timings"
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() =>
                                                updateSetting(
                                                    "dailyBasedOnShift",
                                                    !settings.dailyBasedOnShift
                                                )
                                            }
                                            className={`relative h-7 w-14 rounded-full transition ${settings.dailyBasedOnShift
                                                ? "bg-indigo-600"
                                                : "bg-gray-300"
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${settings.dailyBasedOnShift
                                                    ? "left-8"
                                                    : "left-1"
                                                    }`}
                                            />
                                        </button>

                                        <span
                                            className={`text-sm font-medium ${settings.dailyBasedOnShift
                                                ? "text-indigo-600"
                                                : "text-gray-500"
                                                }`}
                                        >
                                            {settings.dailyBasedOnShift ? "On" : "Off"}
                                        </span>
                                    </div>
                                </GroupRow>

                                <GroupRow
                                    title="If work time is less than"
                                    configure
                                    onConfigure={() => {
                                        setSelectedSetting({
                                            key: "dailyMinimumTime",
                                            label: "If work time is less than",
                                        });

                                        setConfigureOpen(true);
                                    }}
                                >
                                    <div className="flex flex-wrap items-center gap-3">

                                        <input
                                            type="number"
                                            min={0}
                                            max={23}
                                            value={settings.dailyMinimumTime.hours}
                                            onChange={(e) =>
                                                updateSetting("dailyMinimumTime", {
                                                    ...settings.dailyMinimumTime,
                                                    hours: Number(e.target.value),
                                                })
                                            }
                                            className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        />

                                        <span className="text-sm text-gray-500">
                                            Hours
                                        </span>

                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={settings.dailyMinimumTime.minutes}
                                            onChange={(e) =>
                                                updateSetting("dailyMinimumTime", {
                                                    ...settings.dailyMinimumTime,
                                                    minutes: Number(e.target.value),
                                                })
                                            }
                                            className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        />

                                        <span className="text-sm text-gray-500">
                                            Minutes
                                        </span>

                                    </div>
                                </GroupRow>

                                <GroupRow
                                    title="Week days"
                                    configure
                                    onConfigure={() => {
                                        setSelectedSetting({
                                            key: "dailyWeekDays",
                                            label: "Week days",
                                        });

                                        setConfigureOpen(true);
                                    }}
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        {[
                                            { label: "Mon", value: 1 },
                                            { label: "Tue", value: 2 },
                                            { label: "Wed", value: 3 },
                                            { label: "Thu", value: 4 },
                                            { label: "Fri", value: 5 },
                                            { label: "Sat", value: 6 },
                                            { label: "Sun", value: 0 },
                                        ].map((day) => {
                                            const active = settings.dailyWeekDays.includes(day.value);

                                            return (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = settings.dailyWeekDays.includes(day.value)
                                                            ? settings.dailyWeekDays.filter((d) => d !== day.value)
                                                            : [...settings.dailyWeekDays, day.value].sort((a, b) => a - b);

                                                        updateSetting("dailyWeekDays", updated);
                                                    }}
                                                    className={`rounded-md border px-1.5 py-1 text-xs font-medium ${active
                                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                                        : "border-gray-300 bg-white text-gray-600"
                                                        }`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </GroupRow>

                            </SettingGroup>
                        )}
                    </>

                    <ToggleRow
                        title="Send weekly warning emails"
                        description="Notify users weekly when they exceed the idle threshold."
                        checked={settings.weeklyWarningEmails}
                        onToggle={() =>
                            updateSetting(
                                "weeklyWarningEmails",
                                !settings.weeklyWarningEmails
                            )
                        }
                        showConfigure
                        onConfigure={() => {
                            setSelectedSetting({
                                key: "weeklyWarningEmails",
                                label: "Send weekly warning emails",
                            });

                            setConfigureOpen(true);
                        }}
                    />

                    {settings.weeklyWarningEmails && (
                        <SettingGroup>

                            <GroupRow
                                title="Based on shift timings"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() =>
                                            updateSetting(
                                                "weeklyBasedOnShift",
                                                !settings.weeklyBasedOnShift
                                            )
                                        }
                                        className={`relative h-7 w-14 rounded-full transition ${settings.weeklyBasedOnShift
                                            ? "bg-indigo-600"
                                            : "bg-gray-300"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${settings.weeklyBasedOnShift
                                                ? "left-8"
                                                : "left-1"
                                                }`}
                                        />
                                    </button>
                                    <span
                                        className={`text-sm font-medium ${settings.weeklyBasedOnShift
                                            ? "text-indigo-600"
                                            : "text-gray-500"
                                            }`}
                                    >
                                        {settings.weeklyBasedOnShift ? "On" : "Off"}
                                    </span>

                                </div>
                            </GroupRow>

                            <GroupRow
                                title="If work time is less than"
                            >
                                <div className="flex flex-wrap items-center gap-3">

                                    <input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={settings.weeklyMinimumTime.hours}
                                        onChange={(e) =>
                                            updateSetting("weeklyMinimumTime", {
                                                ...settings.weeklyMinimumTime,
                                                hours: Number(e.target.value),
                                            })
                                        }
                                        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />

                                    <span className="text-sm text-gray-500">
                                        Hours
                                    </span>

                                    <input
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={settings.weeklyMinimumTime.minutes}
                                        onChange={(e) =>
                                            updateSetting("weeklyMinimumTime", {
                                                ...settings.weeklyMinimumTime,
                                                minutes: Number(e.target.value),
                                            })
                                        }
                                        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />

                                    <span className="text-sm text-gray-500">
                                        Minutes
                                    </span>

                                </div>
                            </GroupRow>

                        </SettingGroup>
                    )}

                    <ToggleRow
                        title="Set maximum idle percentage"
                        description="Users exceeding this idle percentage can receive warning emails."
                        checked={settings.idlePercentageEnabled}
                        onToggle={() =>
                            updateSetting(
                                "idlePercentageEnabled",
                                !settings.idlePercentageEnabled
                            )
                        }
                    />

                    {settings.idlePercentageEnabled && (
                        <SettingGroup>
                            <GroupRow title="Maximum idle percentage">
                                <div className="flex flex-wrap items-center gap-3">
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={settings.idlePercentage}
                                        onChange={(e) =>
                                            setSettings((prev) => ({
                                                ...prev,
                                                idlePercentage: Number(e.target.value),
                                            }))
                                        }
                                        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />

                                    <span className="text-sm text-gray-500">%</span>

                                    <button
                                        onClick={() =>
                                            updateSetting(
                                                "idlePercentage",
                                                settings.idlePercentage
                                            )
                                        }
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </GroupRow>
                        </SettingGroup>
                    )}
                </div>
            </div>

            {selectedSetting && (
                <ConfigurePerUserModal
                    open={configureOpen}
                    onClose={() => {
                        setConfigureOpen(false);
                        setSelectedSetting(null);
                    }}
                    title={selectedSetting.label}
                    module="emailReports"
                    settingKey={selectedSetting.key}
                    organizationSetting={
                        settings[selectedSetting.key as keyof typeof settings]
                    }
                    advancedFields={
                        selectedSetting.key === "dailyWarningEmails"
                            ? [
                                {
                                    key: "dailyBasedOnShift",
                                    label: "Based on Shift",
                                    type: "toggle",
                                    organizationSetting: settings.dailyBasedOnShift,
                                },
                                {
                                    key: "dailyMinimumTime",
                                    label: "Minimum Time",
                                    type: "time",
                                    organizationSetting: settings.dailyMinimumTime,
                                },
                                {
                                    key: "dailyWeekDays",
                                    label: "Weekdays",
                                    type: "weekdays",
                                    organizationSetting: settings.dailyWeekDays,
                                },
                            ] : selectedSetting.key === "dailyMinimumTime"
                                ? [
                                    {
                                        key: "dailyMinimumTime",
                                        label: "Minimum Time",
                                        type: "time",
                                        organizationSetting: settings.dailyMinimumTime,
                                    },
                                ] : selectedSetting.key === "weeklyWarningEmails"
                                    ? []
                                    : selectedSetting.key === "dailyWeekDays"
                                        ? [
                                            {
                                                key: "dailyWeekDays",
                                                label: "Week days",
                                                type: "weekdays",
                                                organizationSetting: settings.dailyWeekDays,
                                            },
                                        ] : []
                    }
                />
            )}
        </>
    );
}