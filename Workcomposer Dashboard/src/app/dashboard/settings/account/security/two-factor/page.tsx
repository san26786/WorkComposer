"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import SettingsLoading from "@/components/settings/SettingsLoading";

type TwoFactorSettings = {
    owner: boolean;
    admin: boolean;
    manager: boolean;
    user: boolean;
};

export default function TwoFactorPage() {

    const [settings, setSettings] =
        useState<TwoFactorSettings>({
            owner: false,
            admin: false,
            manager: false,
            user: false,
        });

    const [loading, setLoading] = useState(true);
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await API.get("/organization/two-factor");

                setSettings(data);
            } catch (err) {
                console.error(err);

                toast.error("Failed to load two factor settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleToggle = async (
        role: "owner" | "admin" | "manager" | "user"
    ) => {
        const newValue = !settings[role];

        // Update UI immediately
        setSettings((prev) => ({
            ...prev,
            [role]: newValue,
        }));

        setUpdatingRole(role);

        try {
            await API.put("/organization/two-factor", {
                role,
                enabled: newValue,
            });

            toast.success("Two factor settings updated.");

        } catch (err: any) {
            console.error("TWO FACTOR UPDATE ERROR:", err);

            // Roll back UI if request fails
            setSettings((prev) => ({
                ...prev,
                [role]: !newValue,
            }));

            toast.error(
                err.response?.data?.message ||
                "Failed to update two factor settings."
            );
        } finally {
            setUpdatingRole(null);
        }
    };

    const roles = [
        { key: "owner", label: "Owner" },
        { key: "admin", label: "Admin" },
        { key: "manager", label: "Manager" },
        { key: "user", label: "User" },
    ] as const;

    if (loading) {
        return (
            <div className="px-2">
                <SettingsLoading />
            </div>
        );
    }

    return (
        <div className="px-2">
            <h2 className="text-lg font-semibold text-gray-900">
                Two Factor Authentication
            </h2>

            <p className="mt-2 text-sm text-gray-600">
                Users must verify their identity using a 6-digit code sent to
                their email each time they log in.
            </p>

            <p className="text-sm text-gray-600">
                Note: Ensure you have the latest WorkComposer desktop app version.
            </p>

            <div className="mt-10 rounded-2xl bg-white shadow-sm border border-gray-200 p-6">
                <div className="space-y-4 max-w-[240px]">

                    {roles.map(({ key, label }) => (
                        <div
                            key={key}
                            className="flex items-center justify-between"
                        >
                            <h3 className="text-md font-semibold text-gray-900">
                                {label}
                            </h3>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={updatingRole === key}
                                    onClick={() => handleToggle(key)}
                                    className={`relative h-7 w-14 rounded-full transition-colors ${settings[key]
                                        ? "bg-indigo-600"
                                        : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${settings[key]
                                            ? "left-8"
                                            : "left-1"
                                            }`}
                                    />
                                </button>

                                <span className="text-sm text-gray-600">
                                    {settings[key] ? "On" : "Off"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}