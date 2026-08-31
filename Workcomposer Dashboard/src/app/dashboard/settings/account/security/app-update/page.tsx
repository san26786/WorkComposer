"use client";

import { useEffect, useRef, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import ConfigurePerUserModal from "../../../../../../components/settings/ConfigurePerUserModal";
import SettingsLoading from "@/components/settings/SettingsLoading";

type AppUpdateSettings = {
    automaticUpdates: boolean;
    forceUpdates: boolean;
    desktopReleaseEmails: boolean;
};

const AppUpdatePage = () => {

    const [settings, setSettings] = useState<AppUpdateSettings>({
        automaticUpdates: true,
        forceUpdates: false,
        desktopReleaseEmails: false,
    });

    const [loading, setLoading] = useState(true);

    const [updatingSetting, setUpdatingSetting] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [selectedOption, setSelectedOption] = useState<{
        title: string;
        key: "automaticUpdates" | "forceUpdates";
    } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await API.get("/organization/app-updates");

                setSettings(data);
            } catch (err) {
                console.error(err);

                toast.error("Failed to load app update settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleToggle = async (
        setting: keyof AppUpdateSettings
    ) => {
        const newValue = !settings[setting];

        setSettings((prev) => ({
            ...prev,
            [setting]: newValue,
        }));

        setUpdatingSetting(setting);

        try {
            await API.put("/organization/app-updates", {
                setting,
                enabled: newValue,
            });

            toast.success("App update settings updated.");
        } catch (err: any) {
            console.error("APP UPDATE SETTING ERROR:", err);

            setSettings((prev) => ({
                ...prev,
                [setting]: !newValue,
            }));

            toast.error(
                err.response?.data?.message ||
                "Failed to update app update settings."
            );
        } finally {
            setUpdatingSetting(null);
        }
    };

    type ConfigurableOption = {
        key: "automaticUpdates" | "forceUpdates";
        title: string;
        description: string;
        configure: true;
    };

    type NormalOption = {
        key: "desktopReleaseEmails";
        title: string;
        description: string;
        configure: false;
    };

    const updateOptions: (ConfigurableOption | NormalOption)[] = [
        {
            key: "automaticUpdates",
            title: "Enable Automatic App Updates",
            description:
                "Automatically update the desktop app when a new version is available.",
            configure: true,
        },
        {
            key: "forceUpdates",
            title: "Force Automatic Updates",
            description:
                "Require users to update the desktop app before they can continue using it.",
            configure: true,
        },
        {
            key: "desktopReleaseEmails",
            title: "Stay Updated on Desktop App Releases",
            description:
                "Receive an email whenever a new desktop app version is released.",
            configure: false,
        },
    ];

    if (loading) {
        return (
            <div className="px-2">
                <SettingsLoading />
            </div>
        );
    }

    return (
        <>
            <div className="px-2">
                <h2 className="text-lg font-semibold text-gray-900">
                    App Updates
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Configure how desktop app updates are managed for your organization.
                </p>

                <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {updateOptions.map((item, index) => (
                        <div
                            key={item.key}
                            className={`flex items-start justify-between px-6 py-6 ${index !== updateOptions.length - 1
                                ? "border-b border-gray-200"
                                : ""
                                }`}
                        >
                            <div className="max-w-xl">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {item.title}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {item.description}
                                </p>

                                {item.configure && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!item.configure) return;

                                            const option: ConfigurableOption = item;

                                            setSelectedOption({
                                                title: option.title,
                                                key: option.key,
                                            });

                                            setModalOpen(true);
                                        }}
                                        className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Configure per user
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={updatingSetting === item.key}
                                    onClick={() => handleToggle(item.key)}
                                    className={`relative h-7 w-14 rounded-full transition-colors ${settings[item.key]
                                        ? "bg-indigo-600"
                                        : "bg-gray-300"
                                        } ${updatingSetting === item.key
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${settings[item.key]
                                            ? "left-8"
                                            : "left-1"
                                            }`}
                                    />
                                </button>

                                <span className="w-8 text-sm text-gray-600">
                                    {settings[item.key] ? "On" : "Off"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedOption && (
                <ConfigurePerUserModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={selectedOption.title}
                    module="appUpdate"
                    settingKey={selectedOption.key}
                    organizationSetting={settings[selectedOption.key]}
                    options={[]}
                />
            )}
        </>
    )
}

export default AppUpdatePage;
