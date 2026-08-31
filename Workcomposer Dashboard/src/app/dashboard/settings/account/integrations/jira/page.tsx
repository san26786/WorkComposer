"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { HiOutlineLink } from "react-icons/hi2";
import { SiJira } from "react-icons/si";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import API from "@/api";
import { useOptionalDesktop } from "@/context/DesktopContext";

export default function JiraPage() {
    const router = useRouter();
    const desktop = useOptionalDesktop();

    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const { data } = await API.get(
                    "/integrations/jira/status"
                );

                setStatus(data);
            } catch (err: any) {
                console.error("JIRA STATUS ERROR:", err);

                toast.error(
                    err.response?.data?.message ||
                    "Failed to load Jira integration."
                );
            }
        };

        fetchStatus();
    }, []);

    const syncProjects = async () => {
        try {
            setLoading(true);

            await API.post("/integrations/jira/sync-projects");

            toast.success("Projects synced successfully.");
        } catch (err: any) {
            console.error("JIRA SYNC ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to sync projects."
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

        router.push(
            "/dashboard/settings/account/integrations"
        );
    };

    const connectJira = () => {
        window.location.href =
            `${process.env.NEXT_PUBLIC_API_URL}/integrations/jira/connect`;
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-5">

            {/* Back */}
            <button
                type="button"
                onClick={handleBackToIntegrations}
                className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-sm sm:text-base text-gray-500 transition hover:text-gray-900"
            >
                <ArrowLeft size={18} />
                <span>Back to Integrations</span>
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

                <Image
                    src="/icons/jira.png"
                    alt="Jira"
                    width={56}
                    height={56}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl"
                />

                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Jira Integration
                    </h1>

                    <p className="mt-1 text-sm sm:text-base text-gray-500">
                        Sync tasks and track time across platforms
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-sm">

                <div className="px-4 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">

                    <div className="flex flex-col items-center justify-center text-center">

                        {/* Icon */}
                        <div className="flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-blue-50">
                            <HiOutlineLink className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                        </div>

                        {/* Title */}
                        <h2 className="mt-6 sm:mt-8 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            {status?.connected
                                ? "Jira Connected"
                                : "Connect Your Jira Workspace"}
                        </h2>

                        {/* Description */}
                        <p className="mt-3 max-w-xl text-sm sm:text-base leading-6 text-gray-500">
                            Link your Jira Cloud instance to import
                            tasks, track time against Jira issues,
                            and automatically sync work logs —
                            all without leaving your workspace.
                        </p>

                        {/* Connected */}
                        {status?.connected ? (
                            <div className="mt-7 sm:mt-8 flex w-full flex-col items-center">

                                <div className="w-full max-w-md rounded-xl border border-green-200 bg-green-50 px-4 py-4 sm:px-6 text-center">

                                    <p className="font-semibold text-green-700">
                                        ✓ Jira Connected
                                    </p>

                                    <p className="mt-2 break-words text-sm text-gray-600">
                                        Workspace:{" "}
                                        <span className="font-medium">
                                            {status.workspaceName}
                                        </span>
                                    </p>

                                    <p className="mt-1 break-all text-sm text-gray-600">
                                        {status.siteUrl}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={syncProjects}
                                    disabled={loading}
                                    className="mt-6 w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? "Syncing..."
                                        : "Sync Projects"}
                                </button>
                            </div>
                        ) : (
                            /* Not Connected */
                            <button
                                type="button"
                                onClick={connectJira}
                                className="mt-7 sm:mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg"
                            >
                                <SiJira className="h-4 w-4" />
                                Connect to Jira
                            </button>
                        )}

                    </div>

                </div>

                {/* Bottom information */}
                <div className="border-t bg-gray-50 px-4 py-7 sm:px-6 sm:py-8">

                    <h3 className="mb-6 text-center text-xs sm:text-sm font-semibold tracking-[0.2em] text-gray-500">
                        WHAT YOU&apos;LL GET
                    </h3>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">

                        <Feature
                            icon={<SiJira className="h-5 w-5" />}
                            title="Import Tasks"
                            desc="Import Jira issues and work with them inside WorkComposer."
                        />

                        <Feature
                            icon={<HiOutlineLink className="h-6 w-6" />}
                            title="Track Time"
                            desc="Track time against Jira issues while working."
                        />

                        <Feature
                            icon={<ArrowLeft className="h-5 w-5 rotate-180" />}
                            title="Sync Projects"
                            desc="Keep your Jira projects synchronized with WorkComposer."
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

            <p className="mt-2 max-w-[240px] text-xs sm:text-sm leading-5 text-gray-500">
                {desc}
            </p>

        </div>
    );
}