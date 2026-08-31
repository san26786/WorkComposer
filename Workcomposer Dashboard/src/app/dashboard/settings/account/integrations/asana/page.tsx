"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useOptionalDesktop } from "@/context/DesktopContext";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Link2,
    Download,
    Clock3,
    RefreshCw,
    BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import API from "@/api";

export default function AsanaPage() {

    const searchParams = useSearchParams();
    const router = useRouter();
    const desktop = useOptionalDesktop();

    useEffect(() => {
        const status = searchParams.get("status");

        if (!status) return;

        if (status === "connected") {
            toast.success("Asana connected successfully.");
        }

        if (status === "cancelled") {
            toast("Asana connection was cancelled.", {
                icon: "⚠️",
            });
        }

        window.history.replaceState(
            {},
            "",
            "/dashboard/settings/account/integrations/asana"
        );
    }, [searchParams]);

    const [loading, setLoading] = useState(false);
    const [integration, setIntegration] = useState<any>(null);

    const fetchIntegration = async () => {
        try {
            const { data } = await API.get("/integrations/asana");

            setIntegration(data);
        } catch (err: any) {
            console.error("ASANA FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load Asana integration."
            );
        }
    };

    useEffect(() => {
        fetchIntegration();
    }, []);

    const connectAsana = async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/integrations/asana/connect");

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            console.error("ASANA CONNECT ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to connect Asana."
            );
        } finally {
            setLoading(false);
        }
    };

    const disconnectAsana = async () => {
        const confirmed = window.confirm(
            "Disconnect Asana?\n\nThis will stop syncing tasks and remove your stored Asana credentials."
        );

        if (!confirmed) return;

        try {
            setLoading(true);

            const { data } = await API.delete("/integrations/asana");

            toast.success(data.message);

            await fetchIntegration();
        } catch (err: any) {
            console.error("ASANA DISCONNECT ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to disconnect Asana."
            );
        } finally {
            setLoading(false);
        }
    };

    const importProjects = async () => {
        try {
            setLoading(true);

            const { data: workspaces } = await API.get(
                "/integrations/asana/workspaces"
            );

            if (!workspaces.length) {
                toast.error("No workspaces found.");
                return;
            }

            const workspaceId = workspaces[0].gid;

            const { data } = await API.post(
                `/integrations/asana/workspaces/${workspaceId}/import-projects`
            );

            toast.success(data.message);

        } catch (err: any) {
            console.error(err);
            toast.error(
                err.response?.data?.message ||
                "Failed to import projects."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBackToIntegrations = () => {
        if (desktop) {
            desktop.setActiveSetting("integrations");
            return;
        }

        router.push("/dashboard/settings/account/integrations");
    };


    return (
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-5">
            {/* Back */}
            <button
                type="button"
                onClick={handleBackToIntegrations}
                className="mb-6 sm:mb-8 flex items-center gap-2 text-sm sm:text-base text-gray-500 transition hover:text-black"
            >
                <ArrowLeft size={18} />
                <span>Back to Integrations</span>
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <Image
                    src="/icons/asana.png"
                    alt="Asana"
                    width={56}
                    height={56}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl shadow"
                />

                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                        Asana Integration
                    </h1>

                    <p className="mt-1 text-sm sm:text-base text-gray-500">
                        Sync tasks and track time across platforms
                    </p>
                </div>
            </div>

            {/* Hero */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex flex-col items-center px-4 py-8 text-center sm:px-8 sm:py-10 lg:px-10">
                    <div className="mb-5 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gray-100">
                        <Link2
                            size={28}
                            className="text-gray-500 sm:h-[34px] sm:w-[34px]"
                        />
                    </div>

                    <h2 className="text-base sm:text-lg font-semibold">
                        {integration?.connected
                            ? "Asana Connected"
                            : "Connect Your Asana Workspace"}
                    </h2>

                    {integration?.connected ? (
                        <div className="w-full text-center">
                            <p className="font-medium text-green-600">
                                ✓ Successfully connected
                            </p>

                            <p className="mt-2 break-words text-sm text-gray-500">
                                Workspace: {integration.workspaceName}
                            </p>

                            <p className="break-all text-sm text-gray-500">
                                {integration.email}
                            </p>

                            {/* Actions */}
                            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-0">
                                <button
                                    onClick={importProjects}
                                    disabled={loading}
                                    className="w-full rounded-md bg-[#f24b09] px-6 py-2.5 font-medium text-white transition hover:bg-[#e15d2b] disabled:cursor-not-allowed disabled:opacity-60 sm:mr-2 sm:w-auto"
                                >
                                    {loading
                                        ? "Importing..."
                                        : "Import Projects"}
                                </button>

                                <button
                                    onClick={disconnectAsana}
                                    disabled={loading}
                                    className="w-full rounded-md border border-red-300 px-6 py-2.5 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-2 sm:w-auto"
                                >
                                    {loading
                                        ? "Disconnecting..."
                                        : "Disconnect"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                                Link your Asana workspace to import tasks,
                                track time against Asana projects,
                                and automatically sync time entries —
                                all without leaving your workspace.
                            </p>

                            <button
                                onClick={connectAsana}
                                disabled={loading}
                                className="mt-6 w-full rounded-md bg-[#f24b09] px-7 py-2.5 font-semibold text-white transition hover:bg-[#e15d2b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {loading
                                    ? "Connecting..."
                                    : "Connect to Asana"}
                            </button>
                        </>
                    )}
                </div>

                {/* Bottom */}
                <div className="border-t bg-gray-50 px-4 py-7 sm:px-6 sm:py-8">
                    <h3 className="mb-6 text-center text-xs sm:text-sm font-semibold tracking-[0.2em] text-gray-500">
                        WHAT YOU&apos;LL GET
                    </h3>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                        <Feature
                            icon={<Download size={18} />}
                            title="Import Tasks"
                            desc="Pull tasks from Asana projects"
                        />

                        <Feature
                            icon={<Clock3 size={22} />}
                            title="Track Time"
                            desc="Log hours against Asana tasks"
                        />

                        <Feature
                            icon={<RefreshCw size={22} />}
                            title="Auto Sync"
                            desc="Background sync every 15 min"
                        />

                        <Feature
                            icon={<BarChart3 size={22} />}
                            title="Time Entries"
                            desc="Push time entries to Asana"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Feature({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg border bg-white shadow-sm">
                {icon}
            </div>

            <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                {title}
            </h4>

            <p className="mt-2 max-w-[220px] text-xs sm:text-sm leading-5 text-gray-500">
                {desc}
            </p>
        </div>
    );
}