"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOptionalDesktop } from "@/context/DesktopContext";
import API from "@/api";
import {
    ArrowLeft,
    Clock3,
    ClipboardCheck,
    BellRing,
    Activity,
} from "lucide-react";
import toast from "react-hot-toast";

const features = [
    {
        icon: <BellRing className="h-5 w-5 text-blue-600" />,
        title: "Daily & Weekly Reports",
        description: "Receive work summaries directly inside Slack.",
    },
    {
        icon: <Clock3 className="h-5 w-5 text-violet-600" />,
        title: "Time Approvals",
        description: "Approve or reject manual time requests.",
    },
    {
        icon: <ClipboardCheck className="h-5 w-5 text-green-600" />,
        title: "Task Assignments",
        description: "Instant notifications when work is assigned.",
    },
    {
        icon: <Activity className="h-5 w-5 text-orange-500" />,
        title: "Idle Alerts",
        description: "Get notified when idle time exceeds limits.",
    },
];

type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
};


function FeatureCard({
    icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                {icon}
            </div>

            <h4 className="mt-2 text-sm font-semibold text-gray-700">
                {title}
            </h4>

            <p className="mt-1 text-sm leading-5 text-gray-500">
                {description}
            </p>
        </div>
    );
}

export default function SlackIntegrationPage() {
    const router = useRouter();
    const desktop = useOptionalDesktop();

    const [loading, setLoading] = useState(true);
    const [integration, setIntegration] = useState<any>(null);
    const [channels, setChannels] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState("");
    const [notifications, setNotifications] = useState({
        taskAssigned: true,
        taskUpdated: true,
        taskReassigned: true,
        taskCompleted: true,
        dailySummary: true,
        weeklySummary: true,
        reportReady: true,
    });

    const fetchIntegration = async () => {
        try {
            const { data } = await API.get("/integrations/slack");

            setIntegration(data);

            if (data.notifications) {
                setNotifications(data.notifications);
            }

            if (data.connected) {
                await fetchChannels();

                if (data.slackChannelId) {
                    setSelectedChannel(data.slackChannelId);
                }
            }
        } catch (err: any) {
            console.error("SLACK FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load Slack integration."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchChannels = async () => {
        try {
            const { data } = await API.get("/integrations/slack/channels");

            setChannels(data);
        } catch (err: any) {
            console.error("SLACK CHANNELS ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load Slack channels."
            );
        }
    };

    useEffect(() => {
        fetchIntegration();
    }, []);

    const connectSlack = async () => {
        try {
            const { data } = await API.get("/integrations/slack/connect");

            window.location.href = data.url;
        } catch (err: any) {
            console.error("SLACK CONNECT ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to connect Slack."
            );
        }
    };

    const disconnectSlack = async () => {
        try {
            await API.delete("/integrations/slack");

            toast.success("Slack disconnected successfully.");

            fetchIntegration();
        } catch (err: any) {
            console.error("SLACK DISCONNECT ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to disconnect Slack."
            );
        }
    };

    const saveChannel = async () => {
        try {
            const channel = channels.find(
                (c) => c.id === selectedChannel
            );

            if (!channel) return;

            await API.put("/integrations/slack/channel", {
                channelId: channel.id,
                channelName: channel.name,
            });

            await fetchIntegration();

            toast.success(
                "Slack notification channel updated successfully."
            );
        } catch (err: any) {
            console.error("SLACK CHANNEL SAVE ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to save Slack channel."
            );
        }
    };

    const saveNotifications = async () => {
        try {
            await API.put(
                "/integrations/slack/notifications",
                notifications,
            );

            toast.success(
                "Notification preferences updated successfully."
            );
        } catch (err: any) {
            console.error("SLACK NOTIFICATION SAVE ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to update notification preferences."
            );
        }
    };

    const sendTestMessage = async () => {
        try {
            const { data } = await API.post(
                "/integrations/slack/test-message"
            );

            toast.success(
                data.message || "Test message sent successfully."
            );
        } catch (err: any) {
            console.error("SLACK TEST MESSAGE ERROR:", err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to send test message."
            );
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
        <div className="min-h-screen bg-[#f5f7fb]">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Back Button */}
                <button
                    type="button"
                    onClick={handleBackToIntegrations}
                    className="mb-1 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Integrations</span>
                </button>

                {/* Header */}
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <Image
                            src="/icons/slack.png"
                            alt="Slack"
                            width={38}
                            height={38}
                        />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Slack Integration
                        </h1>

                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Get work reports and notifications delivered directly to your
                            team&apos;s Slack workspace.
                        </p>
                    </div>
                </div>

                {/* Connect Card */}

                <div className="mt-7 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex flex-col items-center px-6 py-8 lg:py-10 text-center sm:px-8 lg:px-17">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-gray-500"
                                >
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.8 5" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12.2 19" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="mt-6 text-md sm:text-lg font-semibold text-gray-900">
                            Connect Your Slack Workspace
                        </h2>

                        <p className="mt-4 max-w-3xl text-xs sm:text-sm leading-5 sm:leading-6 text-gray-500">
                            Link your Slack workspace to receive daily work reports,
                            idle alerts, task assignments, and manual time approval
                            requests — all delivered directly inside Slack.
                        </p>

                        {integration?.connected ? (
                            <div className="mt-7 flex w-full flex-col items-center sm:mt-8">

                                <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                                    ✓ Connected
                                </div>

                                <p className="mt-4 text-sm text-gray-500">
                                    Connected Workspace
                                </p>

                                <h3 className="mt-1 max-w-full break-words text-center text-lg font-semibold text-gray-900">
                                    {integration.workspaceName}
                                </h3>

                                <div className="mt-5">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Default Notification Channel
                                    </label>

                                    <select
                                        value={selectedChannel}
                                        onChange={(e) => setSelectedChannel(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#4c1153]"
                                    >
                                        <option value="">Select a channel</option>

                                        {channels.map((channel) => (
                                            <option key={channel.id} value={channel.id}>
                                                #{channel.name}
                                                {channel.isPrivate ? " (Private)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-4 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
                                    <button
                                        onClick={saveChannel}
                                        disabled={!selectedChannel}
                                        className="w-full rounded-xl bg-[#4c1153] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2b0c2c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        Save Channel
                                    </button>

                                    <button
                                        onClick={sendTestMessage}
                                        className="w-full rounded-xl border border-[#4c1153] px-6 py-3 text-sm font-medium text-[#4c1153] transition hover:bg-[#f7eef8] sm:w-auto"
                                    >
                                        Send Test Message
                                    </button>
                                </div>

                                <button
                                    onClick={disconnectSlack}
                                    className="mt-5 w-full rounded-xl border border-red-200 px-6 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:w-auto"
                                >
                                    Disconnect
                                </button>

                                <div className="mt-8 w-full max-w-2xl rounded-xl border border-gray-200 bg-gray-50 p-4 sm:mt-10 sm:p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Notification Preferences
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Choose which WorkComposer events should be sent to Slack.
                                    </p>

                                    <div className="mt-6 space-y-4">
                                        {([
                                            ["taskAssigned", "Task Assigned"],
                                            ["taskUpdated", "Task Updated"],
                                            ["taskReassigned", "Task Reassigned"],
                                            ["taskCompleted", "Task Completed"],
                                            ["dailySummary", "Daily Summary"],
                                            ["weeklySummary", "Weekly Summary"],
                                            ["reportReady", "Report Ready"],
                                        ] as Array<[keyof typeof notifications, string]>).map(([key, label]) => (
                                            <label
                                                key={key}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-sm font-medium text-gray-700">
                                                    {label}
                                                </span>

                                                <input
                                                    type="checkbox"
                                                    checked={notifications[key as keyof typeof notifications]}
                                                    onChange={(e) =>
                                                        setNotifications({
                                                            ...notifications,
                                                            [key]: e.target.checked,
                                                        })
                                                    }
                                                    className="h-5 w-5 rounded border-gray-300 accent-[#4c1153]"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <button
                                        onClick={saveNotifications}
                                        className="mt-6 w-full rounded-xl bg-[#4c1153] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2b0c2c] sm:w-auto"
                                    >
                                        Save Notification Preferences
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <button
                                onClick={connectSlack}
                                className="
            mt-7
            inline-flex
            w-full
            sm:w-auto
            items-center
            justify-center
            gap-3
            rounded-xl
            bg-[#4c1153]
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#2b0c2c]
        "
                            >
                                <Image
                                    src="/icons/slack.png"
                                    alt="Slack"
                                    width={22}
                                    height={22}
                                />

                                Add to Slack
                            </button>
                        )}

                    </div>

                </div>

                {/* Features */}

                <div className="overflow-hidden rounded-b-xl border-t border-gray-200 bg-[#fafbfc]">

                    <div className="px-4 py-7 sm:px-6 sm:py-8">

                        <h3 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-gray-600">
                            What You&apos;ll Get
                        </h3>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            {features.map((feature) => (
                                <FeatureCard
                                    key={feature.title}
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                />
                            ))}

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}