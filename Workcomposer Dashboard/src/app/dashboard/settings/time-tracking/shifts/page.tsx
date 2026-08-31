"use client";

import TrackingHeader from "../tracking/components/TrackingHeader";
import SettingRow from "../tracking/components/SettingRow";
import ToggleRow from "../tracking/components/ToggleRow";
import useShiftSettings from "./hooks/useShiftSettings";
import { useState } from "react";
import ConfigurePerUserModal from "@/components/settings/ConfigurePerUserModal";
import ConfigureShiftScheduleModal from "./components/ConfigureShiftScheduleModal";
import ShiftScheduleEditor from "./components/ShiftScheduleEditor";

export default function ShiftPage() {
    const {
        loading,
        settings,
        updateSettings,
    } = useShiftSettings();

    const [configureModalOpen, setConfigureModalOpen] = useState(false);
    const [configureSetting, setConfigureSetting] = useState<any>(null);
    const [configureShiftModalOpen, setConfigureShiftModalOpen] = useState(false);

    if (loading || !settings) {
        return <div>Loading...</div>;
    }

    return (
        <div className="py-10 flex-1">
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-10">
                <div className="mx-auto mt-8 w-full max-w-6xl rounded-xl border border-gray-200 bg-white shadow-sm">

                    <TrackingHeader
                        title="Shift Settings"
                        description="Configure shift scheduling for your organization."
                    />

                    <SettingRow title="Enable shift scheduling">
                        <ToggleRow
                            checked={settings.enabled}
                            onChange={(checked) =>
                                updateSettings({
                                    ...settings,
                                    enabled: checked,
                                })
                            }
                        />
                    </SettingRow>

                    {settings.enabled && (
                        <>
                            <SettingRow
                                title="Automatically start tracking when the shift begins"
                                showConfigure
                                onConfigure={() => {
                                    setConfigureSetting({
                                        title: "Automatically start tracking when the shift begins",
                                        settingKey: "autoStartTracking",
                                        organizationSetting: settings.autoStartTracking,
                                    });

                                    setConfigureModalOpen(true);
                                }}
                            >
                                <ToggleRow
                                    checked={settings.autoStartTracking}
                                    onChange={(checked) =>
                                        updateSettings({
                                            ...settings,
                                            autoStartTracking: checked,
                                        })
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                title="Automatically stop tracking when the shift ends"
                                showConfigure
                                onConfigure={() => {
                                    setConfigureSetting({
                                        title: "Automatically stop tracking when the shift ends",
                                        settingKey: "autoStopTracking",
                                        organizationSetting: settings.autoStopTracking,
                                    });

                                    setConfigureModalOpen(true);
                                }}
                            >
                                <ToggleRow
                                    checked={settings.autoStopTracking}
                                    onChange={(checked) =>
                                        updateSettings({
                                            ...settings,
                                            autoStopTracking: checked,
                                        })
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                title="Stop tracking during scheduled breaks"
                            >
                                <ToggleRow
                                    checked={settings.stopTrackingDuringBreaks}
                                    onChange={(checked) =>
                                        updateSettings({
                                            ...settings,
                                            stopTrackingDuringBreaks: checked,
                                        })
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                title="Default Work Hours"
                                description="Configure default shift times for each day of the week"
                                showConfigure
                                onConfigure={() => {
                                    setConfigureShiftModalOpen(true);
                                }}
                            >
                                <></>
                            </SettingRow>

                            <ShiftScheduleEditor
                                schedule={settings.schedule}
                                onChange={(updatedSchedule) =>
                                    updateSettings({
                                        ...settings,
                                        schedule: updatedSchedule,
                                    })
                                }
                            />
                        </>
                    )
                    }

                    <ConfigureShiftScheduleModal
                        open={configureShiftModalOpen}
                        onClose={() => setConfigureShiftModalOpen(false)}
                        organizationSchedule={settings.schedule}
                        organizationAutoStartTracking={settings.autoStartTracking}
                        organizationAutoStopTracking={settings.autoStopTracking}
                    />

                    {
                        configureSetting && (
                            <ConfigurePerUserModal
                                open={configureModalOpen}
                                onClose={() => {
                                    setConfigureModalOpen(false);
                                    setConfigureSetting(null);
                                }}
                                title={configureSetting.title}
                                module="shift"
                                settingKey={configureSetting.settingKey}
                                organizationSetting={configureSetting.organizationSetting}
                                options={configureSetting.options ?? []}
                            />
                        )
                    }
                </div >
            </div>
        </div>
    );
}