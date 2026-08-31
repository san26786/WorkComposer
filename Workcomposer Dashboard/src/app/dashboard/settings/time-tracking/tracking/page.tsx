"use client";

import TrackingHeader from "./components/TrackingHeader";
import SettingRow from "./components/SettingRow";
import useTimeTrackingSettings from "./hooks/useTimeTrackingSettings";
import ToggleRow from "./components/ToggleRow";
import ExpandableSetting from "./components/ExpandableSetting";
import CustomSelect from "./components/CustomSelect";
import { useEffect, useState } from "react";
import ConfigurePerUserModal from "@/components/settings/ConfigurePerUserModal";
import socket from "@/socket/socket";
import SettingsLoading from "@/components/settings/SettingsLoading";

type Option = {
    label: string;
    value: string | number;
};

export default function TrackingPage() {

    const {
        loading,
        settings,
        setSettings,
        updateSettings,
    } = useTimeTrackingSettings();

    const [configureModalOpen, setConfigureModalOpen] = useState(false);

    type AdvancedField = {
        key: string;
        label: string;
        organizationSetting: any;
        options: Option[];
    };

    const [configureSetting, setConfigureSetting] = useState<{
        title: string;
        settingKey: string;
        organizationSetting: any;
        options?: Option[];
        advancedFields?: AdvancedField[];
    } | null>(null);

    useEffect(() => {
        const handleSettingsUpdated = (updatedSettings: any) => {
            setSettings(updatedSettings);
        };

        socket.on(
            "tracking-settings-updated",
            handleSettingsUpdated
        );

        return () => {
            socket.off(
                "tracking-settings-updated",
                handleSettingsUpdated
            );
        };
    }, [setSettings]);

    if (loading || !settings) {
        return (
            <div className="py-10 flex-1">
                <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-10">
                    <SettingsLoading />
                </div>
            </div>
        );
    }

    return (
        <div className="py-10 flex-1">
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-10">
                <div className="mx-auto mt-8 w-full max-w-6xl rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="mx-auto max-w-7xl">

                        <TrackingHeader
                            title="Tracking Settings"
                            description="Configure time tracking settings, behavior, and visibility options for your entire organization."
                        />

                        <SettingRow
                            title="Tracking Mode"
                            description="Choose how employees track their working hours."
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Tracking Mode",
                                    settingKey: "trackingMode",
                                    organizationSetting: settings.tracking.trackingMode,
                                    options: [
                                        {
                                            label: "Automatic",
                                            value: "automatic",
                                        },
                                        {
                                            label: "Manual",
                                            value: "manual",
                                        },
                                        {
                                            label: "Silent",
                                            value: "silent",
                                        },
                                    ],
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <CustomSelect
                                width="w-56"
                                value={settings.tracking.trackingMode}
                                options={[
                                    {
                                        label: "Automatic",
                                        value: "automatic",
                                    },
                                    {
                                        label: "Manual",
                                        value: "manual",
                                    },
                                    {
                                        label: "Silent",
                                        value: "silent",
                                    },
                                ]}
                                onChange={(value) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            trackingMode: String(value),
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        <SettingRow
                            title="Start tracking when the computer starts"
                        >
                            <ToggleRow
                                checked={settings.tracking.startTrackingOnBoot}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            startTrackingOnBoot: checked,
                                        },
                                    };

                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        <SettingRow
                            title="Allow work away from the computer"
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Allow work away from the computer",
                                    settingKey: "allowWorkAwayFromComputer",
                                    organizationSetting:
                                        settings.tracking.allowWorkAwayFromComputer,
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <ToggleRow
                                checked={settings.tracking.allowWorkAwayFromComputer}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            allowWorkAwayFromComputer: checked,
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        <SettingRow
                            title="Pause tracking when inactive"
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Pause tracking when inactive",
                                    settingKey: "pauseTrackingWhenInactive",
                                    organizationSetting:
                                        settings.tracking.pauseTrackingWhenInactive,
                                    advancedFields: [
                                        {
                                            key: "inactivityMinutes",
                                            label: "Minutes",
                                            organizationSetting:
                                                settings.tracking.inactivityMinutes,
                                            options: Array.from({ length: 60 }, (_, i) => ({
                                                label: String(i + 1),
                                                value: i + 1,
                                            })),
                                        },
                                    ],
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <ToggleRow
                                checked={settings.tracking.pauseTrackingWhenInactive}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            pauseTrackingWhenInactive: checked,
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        {settings.tracking.pauseTrackingWhenInactive && (
                            <ExpandableSetting>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">
                                            Minutes of inactivity before pause
                                        </h4>

                                        <p className="mt-8 max-w-3xl text-base text-gray-500">
                                            Any inactivity shorter than this counts as worked time.
                                            A higher number means short pauses and breaks are recorded
                                            as work, not as breaks.
                                        </p>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="mb-2 text-sm font-medium text-gray-900">
                                            Minutes
                                        </label>

                                        <CustomSelect
                                            width="w-24"
                                            value={settings.tracking.inactivityMinutes}
                                            options={Array.from({ length: 60 }, (_, i) => ({
                                                label: String(i + 1),
                                                value: i + 1,
                                            }))}
                                            onChange={(value) => {
                                                const updatedSettings = {
                                                    ...settings,
                                                    tracking: {
                                                        ...settings.tracking,
                                                        inactivityMinutes: Number(value),
                                                    },
                                                };

                                                setSettings(updatedSettings);
                                                updateSettings(updatedSettings);
                                            }}
                                        />

                                    </div>
                                </div>
                            </ExpandableSetting>
                        )}

                        <SettingRow
                            title="Continue tracking during computer sleep"
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Continue tracking during computer sleep",
                                    settingKey: "continueTrackingDuringSleep",
                                    organizationSetting:
                                        settings.tracking.continueTrackingDuringSleep,

                                    advancedFields: [
                                        {
                                            key: "sleepBreakHours",
                                            label: "Hours",
                                            organizationSetting:
                                                settings.tracking.sleepBreakHours,
                                            options: Array.from({ length: 24 }, (_, i) => ({
                                                label: String(i),
                                                value: i,
                                            })),
                                        },
                                        {
                                            key: "sleepBreakMinutes",
                                            label: "Minutes",
                                            organizationSetting:
                                                settings.tracking.sleepBreakMinutes,
                                            options: Array.from({ length: 60 }, (_, i) => ({
                                                label: String(i),
                                                value: i,
                                            })),
                                        },
                                    ],
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <ToggleRow
                                checked={settings.tracking.continueTrackingDuringSleep}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            continueTrackingDuringSleep: checked,
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        {settings.tracking.continueTrackingDuringSleep && (
                            <ExpandableSetting>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">
                                            Limit break duration when computer sleeps
                                        </h4>

                                        <p className="mt-8 max-w-3xl text-base text-gray-500">
                                            Breaks longer than this duration will stop the tracking
                                            session instead of being counted as computer sleep.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <label className="mb-2 text-sm font-medium text-gray-900">
                                                Hours
                                            </label>

                                            <CustomSelect
                                                width="w-24"
                                                value={settings.tracking.sleepBreakHours}
                                                options={Array.from({ length: 24 }, (_, i) => ({
                                                    label: String(i),
                                                    value: i,
                                                }))}
                                                onChange={(value) => {
                                                    const updatedSettings = {
                                                        ...settings,
                                                        tracking: {
                                                            ...settings.tracking,
                                                            sleepBreakHours: Number(value),
                                                        },
                                                    };

                                                    setSettings(updatedSettings);
                                                    updateSettings(updatedSettings);
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="mb-2 text-sm font-medium text-gray-900">
                                                Minutes
                                            </label>

                                            <CustomSelect
                                                width="w-24"
                                                value={settings.tracking.sleepBreakMinutes}
                                                options={Array.from({ length: 60 }, (_, i) => ({
                                                    label: String(i),
                                                    value: i,
                                                }))}
                                                onChange={(value) => {
                                                    const updatedSettings = {
                                                        ...settings,
                                                        tracking: {
                                                            ...settings.tracking,
                                                            sleepBreakMinutes: Number(value),
                                                        },
                                                    };

                                                    setSettings(updatedSettings);
                                                    updateSettings(updatedSettings);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ExpandableSetting>
                        )}

                        <SettingRow
                            title="Display back to work reminder"
                        >
                            <ToggleRow
                                checked={settings.tracking.displayBackToWorkReminder}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            displayBackToWorkReminder: checked,
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        <SettingRow
                            title="Stop tracking if not connected to the internet"
                        >
                            <ToggleRow
                                checked={settings.tracking.stopTrackingWithoutInternet}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            stopTrackingWithoutInternet: checked,
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        <SettingRow
                            title="Display horizontal Status Bar"
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Display horizontal Status Bar",
                                    settingKey: "statusBarVisibility",
                                    organizationSetting:
                                        settings.tracking.statusBarVisibility,
                                    options: [
                                        {
                                            label: "Always visible",
                                            value: "always",
                                        },
                                        {
                                            label: "Visible during tracking",
                                            value: "during_tracking",
                                        },
                                        {
                                            label: "Hidden",
                                            value: "hidden",
                                        },
                                    ],
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <CustomSelect
                                width="w-56"
                                value={settings.tracking.statusBarVisibility}
                                options={[
                                    {
                                        label: "Always visible",
                                        value: "always",
                                    },
                                    {
                                        label: "Visible during tracking",
                                        value: "during_tracking",
                                    },
                                    {
                                        label: "Hidden",
                                        value: "hidden",
                                    },
                                ]}
                                onChange={(value) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            statusBarVisibility: String(value),
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>


                        <SettingRow
                            title="Application & website tracking"
                        >
                            <ToggleRow
                                checked={settings.tracking.applicationTracking}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            applicationTracking: checked,
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>
                        <SettingRow
                            title="IP-based Location Tracking"
                        >
                            <ToggleRow
                                checked={settings.tracking.ipTracking}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        tracking: {
                                            ...settings.tracking,
                                            ipTracking: checked,
                                        },
                                    };

                                    setSettings(updatedSettings);
                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                    </div>

                    {
                        configureSetting && (
                            <ConfigurePerUserModal
                                open={configureModalOpen}
                                onClose={() => {
                                    setConfigureModalOpen(false);
                                    setConfigureSetting(null);
                                }}
                                title={configureSetting.title}
                                module="tracking"
                                settingKey={configureSetting.settingKey}
                                organizationSetting={configureSetting.organizationSetting}
                                options={configureSetting.options ?? []}
                                advancedFields={configureSetting.advancedFields ?? []}
                            />
                        )
                    }
                </div >
            </div>
        </div>
    );
}