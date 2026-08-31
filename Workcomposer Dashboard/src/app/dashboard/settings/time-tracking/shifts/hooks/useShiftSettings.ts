"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";

type ShiftSettings = {
    enabled: boolean;
    autoStartTracking: boolean;
    autoStopTracking: boolean;
    stopTrackingDuringBreaks: boolean;
    schedule: any[];
};

export default function useShiftSettings() {
    const [settings, setSettings] = useState<ShiftSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/shift/settings");

            setSettings(data);
        } catch (error: any) {
            console.error("SHIFT SETTINGS FETCH ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load shift settings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: ShiftSettings) => {
        try {
            setSaving(true);

            await API.put("/shift/settings", newSettings);

            setSettings(newSettings);

            toast.success("Shift settings updated.");
        } catch (error: any) {
            console.error("SHIFT SETTINGS UPDATE ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update shift settings."
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
        fetchSettings,
        updateSettings,
    };
}