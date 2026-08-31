"use client";

import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOptionalDesktop } from "@/context/DesktopContext";
import toast from "react-hot-toast";

type BambooHRIntegration = {
    connected?: boolean;
    subdomain?: string;
};

type BambooHREmployee = {
    id: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    workEmail?: string;
    department?: string;
};

type BambooHRTimeOff = {
    id: string;
    name?: string;
    start?: string;
    end?: string;
    type?: string;
};

export default function BambooHRIntegrationPage() {
    const router = useRouter();
    const desktop = useOptionalDesktop();

    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [integration, setIntegration] =
        useState<BambooHRIntegration | null>(null);

    const [apiKey, setApiKey] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [error, setError] = useState("");

    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("");

    // Data views
    const [activeTab, setActiveTab] = useState("employees");
    const [employees, setEmployees] =
        useState<BambooHREmployee[]>([]);

    const [timeOff, setTimeOff] =
        useState<BambooHRTimeOff[]>([]);
    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {
        fetchIntegration();
    }, []);

    const fetchIntegration = async () => {
        try {
            const { data } = await axios.get("/api/integrations/bamboohr", {
                withCredentials: true,
            });

            setIntegration(data);
            if (data?.connected) {
                loadEmployees();
            }
        } catch (err: any) {
            console.error("BAMBOOHR FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load BambooHR integration."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        setDataLoading(true);
        try {
            const { data } = await axios.get("/api/integrations/bamboohr/employees", {
                withCredentials: true,
            });
            setEmployees(data);
        } catch (err: any) {
            console.error("BAMBOOHR EMPLOYEES ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load BambooHR employees."
            );
        } finally {
            setDataLoading(false);
        }
    };

    const loadTimeOff = async () => {
        setDataLoading(true);
        try {
            const { data } = await axios.get("/api/integrations/bamboohr/time-off", {
                withCredentials: true,
            });
            setTimeOff(data || []);
        } catch (err: any) {
            console.error("BAMBOOHR TIME OFF ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load BambooHR time off."
            );
        } finally {
            setDataLoading(false);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === "employees" && employees.length === 0) loadEmployees();
        if (tab === "timeoff" && timeOff.length === 0) loadTimeOff();
    };

    const handleConnect = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setError("");

        if (!apiKey || !subdomain) {
            setError("Please enter both your API key and subdomain.");
            return;
        }

        setConnecting(true);

        try {
            await axios.post(
                "/api/integrations/bamboohr/connect",
                { apiKey, subdomain },
                { withCredentials: true }
            );

            toast.success("BambooHR connected successfully.");

            setApiKey("");
            await fetchIntegration();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                "Failed to connect BambooHR. Check your API key and subdomain.";

            setError(message);
            toast.error(message);
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await axios.delete("/api/integrations/bamboohr", {
                withCredentials: true,
            });

            toast.success("BambooHR disconnected successfully.");

            await fetchIntegration();
        } catch (err: any) {
            console.error("BAMBOOHR DISCONNECT ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to disconnect BambooHR."
            );
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncMessage("");

        try {
            const { data } = await axios.post(
                "/api/integrations/bamboohr/sync-employees",
                {},
                { withCredentials: true }
            );

            const message =
                `Synced ${data.syncedCount} employee${data.syncedCount === 1 ? "" : "s"} from BambooHR.`;

            setSyncMessage(message);
            toast.success(message);
            await loadEmployees();
        } catch (err: any) {
            console.error("BAMBOOHR SYNC ERROR:", err);

            const message =
                err.response?.data?.message ||
                "Failed to sync employees from BambooHR.";

            setSyncMessage(message);
            toast.error(message);
        } finally {
            setSyncing(false);
        }
    };

    const handleBackToIntegrations = () => {
        if (desktop) {
            desktop.setActiveSetting("integrations");
            return;
        }

        router.push("/dashboard/settings/account/integrations");
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-6">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
            {/* Back link */}
            <button
                type="button"
                onClick={handleBackToIntegrations}
                className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
            >
                <span>←</span>
                <span>Back to Integrations</span>
            </button>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Image
                    src="/icons/bamboohr.png"
                    alt="BambooHR"
                    width={48}
                    height={48}
                />

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">BambooHR</h1>
                    <p className="mt-1 text-sm text-gray-600 sm:text-base">
                        Sync employee directory and leave information.
                    </p>
                </div>
            </div>

            {integration?.connected ? (
                <div className="space-y-6">
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                <span className="font-medium text-gray-900">Connected</span>
                            </div>

                            <button
                                onClick={handleDisconnect}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Disconnect
                            </button>
                        </div>

                        <dl className="mb-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-gray-500">Subdomain</dt>
                                <dd className="text-gray-900 font-medium">
                                    {integration.subdomain}.bamboohr.com
                                </dd>
                            </div>
                        </dl>

                        <div className="border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-semibold text-gray-900 mb-2">
                                Employee Sync
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                You&apos;ll need an API key generated from your BambooHR account and
                                your company subdomain.
                            </p>
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                            >
                                {syncing ? "Syncing..." : "Sync Employees Now"}
                            </button>

                            {syncMessage && (
                                <p className="mt-3 text-sm text-gray-600">{syncMessage}</p>
                            )}
                        </div>
                    </div>

                    {/* Directory & Leaves Tabs */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="mb-4 flex gap-4 overflow-x-auto border-b border-gray-200">
                            <button
                                onClick={() => handleTabChange("employees")}
                                className={`pb-2 text-sm font-medium border-b-2 ${activeTab === "employees"
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Directory ({employees.length})
                            </button>
                            <button
                                onClick={() => handleTabChange("timeoff")}
                                className={`pb-2 text-sm font-medium border-b-2 ${activeTab === "timeoff"
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Who&apos;s Out
                            </button>
                        </div>

                        {dataLoading ? (
                            <p className="text-sm text-gray-500 py-4">Fetching data...</p>
                        ) : activeTab === "employees" ? (
                            <div className="divide-y divide-gray-100">
                                {employees.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">
                                        No employees found.
                                    </p>
                                ) : (
                                    employees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {emp.displayName || `${emp.firstName} ${emp.lastName}`}
                                                </p>
                                                <p className="text-gray-500">{emp.workEmail}</p>
                                            </div>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                {emp.department || "No Department"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {timeOff.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">
                                        No upcoming time off scheduled.
                                    </p>
                                ) : (
                                    timeOff.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-gray-500 text-xs">
                                                    {item.start} → {item.end}
                                                </p>
                                            </div>
                                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                                                {item.type || "Time Off"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleConnect}
                    className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6"
                >
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">
                        Connect your BambooHR account
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        You&apos;ll need an API key generated from your BambooHR account and
                        your company subdomain.
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subdomain
                        </label>
                        <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-gray-900">
                            <input
                                type="text"
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value.trim())}
                                placeholder="yourcompany"
                                className="flex-1 px-3 py-2 text-sm outline-none"
                            />
                            <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-l border-gray-300">
                                .bamboohr.com
                            </span>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value.trim())}
                            placeholder="Paste your BambooHR API key"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                        Find this under your BambooHR account → API Keys.
                    </p>

                    {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

                    <button
                        type="submit"
                        disabled={connecting}
                        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
                    >
                        {connecting ? "Connecting..." : "Connect BambooHR"}
                    </button>
                </form>
            )}
        </div>
    );
}