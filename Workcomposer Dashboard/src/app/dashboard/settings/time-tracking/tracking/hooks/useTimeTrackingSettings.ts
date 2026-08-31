"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import socket from "@/socket/socket";

export default function useTimeTrackingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState<any>(null);

    const fetchSettings = async () => {
        try {
            const { data } = await API.get("/time-tracking/settings");
            setSettings(data);
        } catch (error: any) {
            console.error("TIME TRACKING SETTINGS FETCH ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load time tracking settings."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: any) => {
        try {
            setSaving(true);

            await API.put("/time-tracking/settings", newSettings);

            setSettings(newSettings);

            toast.success("Time tracking settings updated.");
        } catch (error: any) {
            console.error("TIME TRACKING SETTINGS UPDATE ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update time tracking settings."
            );
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

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