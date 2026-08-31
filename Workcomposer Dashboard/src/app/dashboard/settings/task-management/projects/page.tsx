"use client"

import { useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import SettingsLoading from "@/components/settings/SettingsLoading";;

const ProjectPage = () => {

    const [settings, setSettings] = useState({
        notifyTaskAssignedEmail: true,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await API.get("/organization/task-management");

            setSettings(data);
        } catch (err: any) {
            console.error("TASK MANAGEMENT SETTINGS FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load task management settings."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (value: boolean) => {
        const previousValue = settings.notifyTaskAssignedEmail;

        try {
            setSettings((prev) => ({
                ...prev,
                notifyTaskAssignedEmail: value,
            }));

            await API.put("/organization/task-management", {
                setting: "notifyTaskAssignedEmail",
                value,
            });

            toast.success("Task management settings updated.");
        } catch (err: any) {
            console.error(
                "TASK MANAGEMENT SETTINGS UPDATE ERROR:",
                err
            );

            // Roll back optimistic update
            setSettings((prev) => ({
                ...prev,
                notifyTaskAssignedEmail: previousValue,
            }));

            toast.error(
                err.response?.data?.message ||
                "Failed to update task management settings."
            );
        }
    };

    if (loading) {
        return (
            <div className="py-10 flex-1">
                <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                    <SettingsLoading />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="py-10 flex-1">
                <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                    <div className="min-h-[calc(100vh-250px)] px-2 sm:px-4 my-2 py-4 rounded-lg bg-white shadow-sm">
                        <div className="space-y-8 max-w-7xl mx-auto pb-12">
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    Task Management Settings
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configure project and task management settings for your organization
                                </p>
                            </div>

                            <div className="mb-10">
                                <table className="min-w-full">
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <td className="py-5 px-6 text-gray-700">
                                                <div className="font-medium text-gray-900 text-base">
                                                    Notify the user via email when a task is assigned
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 min-w-40 max-w-xs">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={settings.notifyTaskAssignedEmail}
                                                        disabled={loading}
                                                        onClick={() =>
                                                            updateSetting(!settings.notifyTaskAssignedEmail)
                                                        }
                                                        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.notifyTaskAssignedEmail
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                            }`}
                                                    >
                                                        <span className="sr-only">Toggle setting</span>

                                                        <span
                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${settings.notifyTaskAssignedEmail
                                                                ? "translate-x-6"
                                                                : "translate-x-0"
                                                                }`}
                                                        />
                                                    </button>
                                                    <span className="text-sm font-medium text-indigo-600">
                                                        {settings.notifyTaskAssignedEmail ? "On" : "Off"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 w-48"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectPage;
