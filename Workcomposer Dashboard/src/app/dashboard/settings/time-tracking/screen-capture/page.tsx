"use client";

import { useState } from "react";
import TrackingHeader from "../tracking/components/TrackingHeader";
import SettingRow from "../tracking/components/SettingRow";
import ToggleRow from "../tracking/components/ToggleRow";
import CustomSelect from "../tracking/components/CustomSelect";
import ConfigurePerUserModal from "@/components/settings/ConfigurePerUserModal";
import useScreenCaptureSettings from "./hooks/useScreenCaptureSettings";

type Option = {
    label: string;
    value: string | number;
};

type AdvancedField = {
    key: string;
    label: string;
    organizationSetting: any;
    options: Option[];
};

export default function ScreenCapturePage() {
    const {
        loading,
        settings,
        updateSettings,
    } = useScreenCaptureSettings();

    const [configureModalOpen, setConfigureModalOpen] = useState(false);

    const [configureSetting, setConfigureSetting] = useState<{
        title: string;
        settingKey: string;
        organizationSetting: any;
        options?: Option[];
        advancedFields?: AdvancedField[];
    } | null>(null);

    if (loading || !settings) {
        return <div>Loading...</div>;
    }

    const frequencyOptions = [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "5", value: 5 },
        { label: "10", value: 10 },
        { label: "15", value: 15 },
        { label: "20", value: 20 },
        { label: "30", value: 30 },
        { label: "60", value: 60 },
    ];

    const blurOptions = [
        {
            label: "Disabled",
            value: "disabled",
        },
        {
            label: "Slightly Blurred",
            value: "slightly_blurred",
        },
        {
            label: "Maximum Blurring",
            value: "maximum_blurring",
        },
    ];

    return (
        <div className="py-10 flex-1">
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-10">
                <div className="mx-auto mt-8 w-full max-w-6xl rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl">

                        <TrackingHeader
                            title="Screen Capture Settings"
                            description="Configure screenshot capture behavior across your organization."
                        />

                        {/* Settings go here */}
                        <SettingRow
                            title="Capture screenshots when tracking"
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Capture screenshots when tracking",
                                    settingKey: "enabled",
                                    organizationSetting: settings.enabled,
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <ToggleRow
                                checked={settings.enabled}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        enabled: checked,
                                    };

                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>

                        <SettingRow
                            title="Randomize screenshot frequency"
                        >
                            <ToggleRow
                                checked={settings.randomizeFrequency}
                                onChange={(checked) => {
                                    const updatedSettings = {
                                        ...settings,
                                        randomizeFrequency: checked,
                                    };

                                    updateSettings(updatedSettings);
                                }}
                            />
                        </SettingRow>


                        <SettingRow
                            title="Screenshot frequency"
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Screenshot frequency",
                                    settingKey: "screenshotFrequency",
                                    organizationSetting: settings.screenshotFrequency,
                                    options: frequencyOptions
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <div className="flex flex-col">
                                <label className="mb-2 text-sm font-medium text-gray-900">
                                    Minutes
                                </label>

                                <CustomSelect
                                    width="w-24"
                                    value={settings.screenshotFrequency}
                                    options={frequencyOptions}
                                    onChange={(value) => {
                                        const updatedSettings = {
                                            ...settings,
                                            screenshotFrequency: Number(value),
                                        };

                                        updateSettings(updatedSettings);
                                    }}
                                />
                            </div>
                        </SettingRow>

                        <SettingRow
                            title="Blur screenshots before uploading"
                            showConfigure
                            onConfigure={() => {
                                setConfigureSetting({
                                    title: "Blur screenshots before uploading",
                                    settingKey: "blurScreenshots",
                                    organizationSetting: settings.blurScreenshots,
                                    options: blurOptions,
                                });

                                setConfigureModalOpen(true);
                            }}
                        >
                            <div className="flex flex-col">
                                <CustomSelect
                                    width="w-56"
                                    value={settings.blurScreenshots}
                                    options={blurOptions}
                                    onChange={(value) => {
                                        const updatedSettings = {
                                            ...settings,
                                            blurScreenshots: value,
                                        };

                                        updateSettings(updatedSettings);
                                    }}
                                />
                            </div>
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
                            module="screenCapture"
                            settingKey={configureSetting.settingKey}
                            organizationSetting={configureSetting.organizationSetting}
                            options={configureSetting.options ?? []}
                            advancedFields={configureSetting.advancedFields ?? []}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}