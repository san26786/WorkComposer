"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";

type ManualTimeSettings = {
    allowManualTime: boolean;
    requireApproval: boolean;
    managerApproval: boolean;
    backdatingLimit: number;
    requireProjectTask: boolean;
};

export default function useManualTimeSettings() {
    const [settings, setSettings] =
        useState<ManualTimeSettings | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);

            const { data } = await API.get(
                "/manual-time/settings"
            );

            setSettings(data);
        } catch (error: any) {
            console.error("MANUAL TIME SETTINGS FETCH ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load manual time settings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (
        newSettings: ManualTimeSettings
    ) => {
        try {
            setSaving(true);

            await API.put(
                "/manual-time/settings",
                newSettings
            );

            setSettings(newSettings);

            toast.success("Manual time settings updated.");
        } catch (error: any) {
            console.error("MANUAL TIME SETTINGS UPDATE ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update manual time settings."
            );
        } finally {
            setSaving(false);
        }
    };

    return {
        loading,
        saving,
        settings,
        setSettings,
        updateSettings,
        fetchSettings,
    };
}