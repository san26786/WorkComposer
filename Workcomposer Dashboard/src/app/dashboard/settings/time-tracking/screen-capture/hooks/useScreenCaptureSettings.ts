"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";

export default function useScreenCaptureSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState<any>(null);

    const fetchSettings = async () => {
        try {
            const { data } = await API.get("/screen-capture/settings");
            setSettings(data);
        } catch (error: any) {
            console.error("SCREEN CAPTURE SETTINGS FETCH ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load screen capture settings."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: any) => {
        try {
            setSaving(true);

            await API.put(
                "/screen-capture/settings",
                newSettings
            );

            setSettings(newSettings);

            toast.success("Screen capture settings updated.");
        } catch (error: any) {
            console.error("SCREEN CAPTURE SETTINGS UPDATE ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update screen capture settings."
            );
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        loading,
        saving,
        settings,
        setSettings,
        fetchSettings,
        updateSettings,
    };
}