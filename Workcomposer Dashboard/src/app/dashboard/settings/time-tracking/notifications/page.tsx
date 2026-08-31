"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";

import TrackingHeader from "../tracking/components/TrackingHeader";
import SettingRow from "../tracking/components/SettingRow";
import ToggleRow from "../tracking/components/ToggleRow";
import SettingsLoading from "@/components/settings/SettingsLoading";
import ConfigurePerUserModal from "@/components/settings/ConfigurePerUserModal";

type Notifications = {
    shiftStarted: boolean;
    shiftEndingSoon: boolean;
    breakStarted: boolean;
    breakEnded: boolean;
    dailyTargetReached: boolean;
    overtimeStarted: boolean;
};

type ConfigureSetting = {
    title: string;
    settingKey: keyof Notifications;
    organizationSetting: boolean;
};

const defaultNotifications: Notifications = {
    shiftStarted: true,
    shiftEndingSoon: true,
    breakStarted: true,
    breakEnded: true,
    dailyTargetReached: true,
    overtimeStarted: true,
};

export default function TrackingNotificationsPage() {
    const [notifications, setNotifications] =
        useState<Notifications | null>(null);

    const [saving, setSaving] = useState(false);

    const [configureModalOpen, setConfigureModalOpen] =
        useState(false);

    const [configureSetting, setConfigureSetting] =
        useState<ConfigureSetting | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await API.get(
                    "/organization/notifications",
                );

                setNotifications({
                    ...defaultNotifications,
                    ...(data.notifications || {}),
                });
            } catch (error: any) {
                console.error(
                    "NOTIFICATION SETTINGS LOAD ERROR:",
                    error,
                );

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load notification settings.",
                );
            }
        };

        load();
    }, []);

    const updateNotification = async (
        key: keyof Notifications,
        value: boolean,
    ) => {
        if (!notifications || saving) return;

        const previous = notifications;

        const updated = {
            ...notifications,
            [key]: value,
        };

        try {
            setSaving(true);
            setNotifications(updated);

            await API.patch(
                "/organization/notifications",
                {
                    notifications: updated,
                },
            );

            toast.success(
                "Notification settings updated.",
            );
        } catch (error: any) {
            console.error(
                "NOTIFICATION SETTINGS UPDATE ERROR:",
                error,
            );

            setNotifications(previous);

            toast.error(
                error.response?.data?.message ||
                "Failed to update notification settings.",
            );
        } finally {
            setSaving(false);
        }
    };

    const openConfigure = (
        title: string,
        settingKey: keyof Notifications,
    ) => {
        if (!notifications) return;

        setConfigureSetting({
            title,
            settingKey,
            organizationSetting:
                notifications[settingKey],
        });

        setConfigureModalOpen(true);
    };

    if (!notifications) {
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

                    <TrackingHeader
                        title="Tracking Notifications"
                        description="Choose which time-tracking notifications your organization receives."
                    />

                    <SettingRow
                        title="Shift started"
                        description="Notify users when their scheduled shift begins."
                        showConfigure
                        onConfigure={() =>
                            openConfigure(
                                "Shift started",
                                "shiftStarted",
                            )
                        }
                    >
                        <ToggleRow
                            checked={notifications.shiftStarted}
                            onChange={(checked) =>
                                updateNotification(
                                    "shiftStarted",
                                    checked,
                                )
                            }
                        />
                    </SettingRow>

                    <SettingRow
                        title="Shift ending soon"
                        description="Notify users 15 minutes before their scheduled shift ends."
                        showConfigure
                        onConfigure={() =>
                            openConfigure(
                                "Shift ending soon",
                                "shiftEndingSoon",
                            )
                        }
                    >
                        <ToggleRow
                            checked={
                                notifications.shiftEndingSoon
                            }
                            onChange={(checked) =>
                                updateNotification(
                                    "shiftEndingSoon",
                                    checked,
                                )
                            }
                        />
                    </SettingRow>

                    <SettingRow
                        title="Break started"
                        description="Notify users when a scheduled break begins."
                        showConfigure
                        onConfigure={() =>
                            openConfigure(
                                "Break started",
                                "breakStarted",
                            )
                        }
                    >
                        <ToggleRow
                            checked={notifications.breakStarted}
                            onChange={(checked) =>
                                updateNotification(
                                    "breakStarted",
                                    checked,
                                )
                            }
                        />
                    </SettingRow>

                    <SettingRow
                        title="Break ended"
                        description="Notify users when a scheduled break ends."
                        showConfigure
                        onConfigure={() =>
                            openConfigure(
                                "Break ended",
                                "breakEnded",
                            )
                        }
                    >
                        <ToggleRow
                            checked={notifications.breakEnded}
                            onChange={(checked) =>
                                updateNotification(
                                    "breakEnded",
                                    checked,
                                )
                            }
                        />
                    </SettingRow>

                    <SettingRow
                        title="Daily target reached"
                        description="Notify users when they reach their expected daily work time."
                        showConfigure
                        onConfigure={() =>
                            openConfigure(
                                "Daily target reached",
                                "dailyTargetReached",
                            )
                        }
                    >
                        <ToggleRow
                            checked={
                                notifications.dailyTargetReached
                            }
                            onChange={(checked) =>
                                updateNotification(
                                    "dailyTargetReached",
                                    checked,
                                )
                            }
                        />
                    </SettingRow>

                    <SettingRow
                        title="Overtime started"
                        description="Notify users when they begin working beyond their scheduled shift."
                        showConfigure
                        onConfigure={() =>
                            openConfigure(
                                "Overtime started",
                                "overtimeStarted",
                            )
                        }
                    >
                        <ToggleRow
                            checked={
                                notifications.overtimeStarted
                            }
                            onChange={(checked) =>
                                updateNotification(
                                    "overtimeStarted",
                                    checked,
                                )
                            }
                        />
                    </SettingRow>

                </div>

                {configureSetting && (
                    <ConfigurePerUserModal
                        open={configureModalOpen}
                        onClose={() => {
                            setConfigureModalOpen(false);
                            setConfigureSetting(null);
                        }}
                        title={configureSetting.title}
                        module="notifications"
                        settingKey={
                            configureSetting.settingKey
                        }
                        organizationSetting={
                            configureSetting.organizationSetting
                        }
                    />
                )}
            </div>
        </div>
    );
}