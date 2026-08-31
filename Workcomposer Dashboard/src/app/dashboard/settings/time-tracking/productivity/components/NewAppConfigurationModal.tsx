"use client";

import API from "@/api";
import toast from "react-hot-toast";
import { AppWindow, Users, User, CheckCircle2, Check, Search } from "lucide-react";
import { LuCircleCheck } from "react-icons/lu";
import { BsInfoCircle } from "react-icons/bs";
import { TiWarningOutline } from "react-icons/ti";
import { PiUmbrellaDuotone } from "react-icons/pi";
import { useEffect, useState } from "react";

type Props = {
    open: boolean;
    editingApp?: any;
    onClose: () => void;
    onSuccess: () => void;
};
export default function NewAppConfigurationModal({
    open,
    editingApp,
    onClose,
    onSuccess,
}: Props) {

    const [appName, setAppName] = useState("");
    const [classification, setClassification] = useState("productive");
    const [preventBreakMode, setPreventBreakMode] = useState(false);
    const [disableIdleCalculation, setDisableIdleCalculation] = useState(false);
    const [keepTrackingLowActivity, setKeepTrackingLowActivity] = useState(true);
    const [activeTab, setActiveTab] = useState<"details" | "exclusions">("details");
    const [exclusionTab, setExclusionTab] = useState<"teams" | "users">("teams");
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [teamSearch, setTeamSearch] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [selectedTeamFilter, setSelectedTeamFilter] = useState("all");
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!editingApp) return;

        setAppName(editingApp.appName || "");
        setClassification(editingApp.productivity || "productive");

        setPreventBreakMode(
            editingApp.preventBreakMode || false
        );

        setDisableIdleCalculation(
            editingApp.disableIdleCalculation || false
        );

        setKeepTrackingLowActivity(
            editingApp.keepTrackingLowActivity ?? true
        );

        setSelectedTeams(
            (editingApp.excludedTeams || []).map((team: any) =>
                typeof team === "string" ? team : team._id
            )
        );

        setSelectedUsers(
            (editingApp.excludedUsers || []).map((user: any) =>
                typeof user === "string" ? user : user._id
            )
        );
    }, [editingApp]);

    const fetchTeams = async () => {
        try {
            const { data } = await API.get("/teams");
            setTeams(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load teams.");
        }
    };

    const handleCreate = async () => {
        if (!appName.trim()) {
            toast.error("Application name is required.");
            return;
        }

        try {
            const payload = {
                appName: appName.trim(),
                productivity: classification,
                preventBreakMode,
                disableIdleCalculation,
                excludedTeams: selectedTeams,
                excludedUsers: selectedUsers,
            };

            if (editingApp) {
                await API.put(
                    `/app-classifications/${editingApp._id}`,
                    payload
                );

                toast.success("App configuration updated successfully.");
            } else {
                await API.post(
                    "/app-classifications",
                    payload
                );

                toast.success("App configuration created successfully.");
            }

            await onSuccess();

            setAppName("");
            setClassification("productive");
            setPreventBreakMode(false);
            setDisableIdleCalculation(false);
            setKeepTrackingLowActivity(true);

            setSelectedTeams([]);
            setSelectedUsers([]);
            setTeamSearch("");
            setUserSearch("");
            setSelectedTeamFilter("all");
            setActiveTab("details");
            setExclusionTab("teams");

            onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                `Failed to ${editingApp ? "update" : "create"} app configuration.`
            );
        }
    };

    const filteredTeams = teams.filter((team) =>
        team.name.toLowerCase().includes(teamSearch.toLowerCase())
    );

    const allTeamsSelected =
        filteredTeams.length > 0 &&
        filteredTeams.every((team: any) => selectedTeams.includes(team._id));

    const toggleSelectAllTeams = (checked: boolean) => {
        if (checked) {
            const ids = filteredTeams.map((team: any) => team._id);

            setSelectedTeams([
                ...new Set([...selectedTeams, ...ids]),
            ]);
        } else {
            setSelectedTeams(
                selectedTeams.filter(
                    (id) =>
                        !filteredTeams.some((team: any) => team._id === id)
                )
            );
        }
    };


    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);

            const { data } = await API.get("/users");

            setUsers(
                Array.isArray(data)
                    ? data
                    : data.users || data.data || []
            );
        } catch (error: any) {
            console.error("USERS FETCH ERROR:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        if (activeTab !== "exclusions") return;

        if (exclusionTab === "teams") {
            fetchTeams();
        }

        if (exclusionTab === "users") {
            fetchUsers();
            fetchTeams();
        }
    }, [open, activeTab, exclusionTab]);

    const filteredUsers = users.filter((user: any) => {
        const matchesSearch =
            user.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearch.toLowerCase());

        const matchesTeam =
            selectedTeamFilter === "all" ||
            user.team?._id === selectedTeamFilter;

        return matchesSearch && matchesTeam;
    });

    const allUsersSelected =
        filteredUsers.length > 0 &&
        filteredUsers.every((user: any) =>
            selectedUsers.includes(user._id)
        );

    const toggleSelectAllUsers = (checked: boolean) => {
        if (checked) {
            const ids = filteredUsers.map((user: any) => user._id);

            setSelectedUsers([
                ...new Set([...selectedUsers, ...ids]),
            ]);
        } else {
            setSelectedUsers(
                selectedUsers.filter(
                    (id) =>
                        !filteredUsers.some((user: any) => user._id === id)
                )
            );
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-4xl h-[91vh] rounded-lg shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="px-6 pt-6 pb-5">
                        <h1 className="text-2xl font-bold text-gray-900">
                            New App Configuration
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Define app tracking rules and manage exclusion permissions
                        </p>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 overflow-hidden">

                        {/* Left Sidebar */}
                        <div className="w-64 border-r border-gray-300 bg-gray-50 p-4">

                            <button
                                onClick={() => setActiveTab("details")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "details"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "text-gray-700 hover:bg-white"
                                    }`}
                            >

                                <AppWindow className="w-5 h-5" />

                                <div className="text-left">
                                    <p className="text-sm font-semibold">
                                        App Details
                                    </p>

                                    <p className="text-xs text-indigo-600">
                                        Configure tracking
                                    </p>
                                </div>

                            </button>

                            <button
                                onClick={() => setActiveTab("exclusions")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-2 transition ${activeTab === "exclusions"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "text-gray-700 hover:bg-white"
                                    }`}
                            >

                                <Users className="w-5 h-5" />

                                <div className="text-left">
                                    <p className="text-sm font-semibold">
                                        Exclusions
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Teams & Users
                                    </p>
                                </div>

                            </button>

                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto px-10">

                            <div className="w-full max-w-3xl pr-8">

                                {activeTab === "details" && (
                                    <>
                                        {/* Application Name */}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Application or Website Name{" "}
                                                <span className="text-red-700">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                value={appName}
                                                onChange={(e) => setAppName(e.target.value)}
                                                placeholder="Enter app or website name (e.g., Chrome, firefox.com, Slack)"
                                                className="w-full h-9 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />

                                            <p className="text-xs text-gray-500 mt-1">
                                                Provide the exact name of the application or website domain to track
                                            </p>
                                        </div>

                                        {/* Classification */}

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Classification
                                            </label>

                                            <select
                                                value={classification}
                                                onChange={(e) => setClassification(e.target.value)}
                                                className="w-full h-9 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="productive">
                                                    Productive
                                                </option>

                                                <option value="neutral">
                                                    Neutral
                                                </option>

                                                <option value="unproductive">
                                                    Unproductive
                                                </option>

                                                <option value="blacklisted">
                                                    Blacklisted
                                                </option>
                                            </select>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Choose how this application should be classified in productivity reports
                                            </p>
                                        </div>

                                        {classification === "productive" && (
                                            <>
                                                <div className="mt-6 rounded-md bg-gray-100 px-4 py-2.5">
                                                    <div className="inline-flex justify-center items-center">
                                                        <LuCircleCheck className="w-3.5 h-3.5 mr-2 text-green-700" />
                                                        <p className="text-sm text-gray-700">
                                                            Keep tracking work time even with low activity.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-lg border border-gray-200 bg-green-50 px-4 py-2.5">
                                                    <div className="inline-flex">
                                                        <BsInfoCircle className="w-3 h-3 text-green-700 mt-0.5 mr-2" />
                                                        <p className="text-xs text-green-700">
                                                            This app will be categorized as{" "}
                                                            <span className="font-semibold capitalize">
                                                                {classification}
                                                            </span>{" "}
                                                            in reports, even if you don&apos;t enable the options below.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={() => setPreventBreakMode(!preventBreakMode)}
                                                    className={`mt-6 cursor-pointer rounded-xl border border-indigo-500 p-3 transition-all ${preventBreakMode
                                                        ? "border-indigo-500 bg-indigo-50"
                                                        : "border-gray-200 hover:border-indigo-300"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1">
                                                            {preventBreakMode ? (
                                                                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                                                            ) : (
                                                                <div className="w-3 h-3 rounded border border-gray-300" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                Prevent break mode
                                                            </h3>

                                                            <p className="text-xs text-gray-500">
                                                                Keep tracking when the user is idle with this app in the
                                                                foreground (e.g. video conferencing, training videos,
                                                                webinars).
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={() => setDisableIdleCalculation(!disableIdleCalculation)}
                                                    className={`mt-4 cursor-pointer rounded-xl border p-3 transition-all ${disableIdleCalculation
                                                        ? "border-indigo-500 bg-indigo-50"
                                                        : "border-gray-200 hover:border-indigo-300"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1">
                                                            {disableIdleCalculation ? (
                                                                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                                                            ) : (
                                                                <div className="w-3 h-3 rounded border border-gray-300" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                Disable idle time calculation
                                                            </h3>

                                                            <p className="text-xs text-gray-500">
                                                                Show higher activity percentage even during idle periods
                                                                (e.g. reading documents, reviewing reports).
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                            </>
                                        )}

                                        {classification === "neutral" && (
                                            <div className="mt-6 rounded-md bg-gray-100 px-4 py-3">
                                                <div className="inline-flex items-start">
                                                    <BsInfoCircle className="w-3.5 h-3.5 mt-0.5 mr-2 text-gray-500" />

                                                    <p className="text-sm text-gray-700">
                                                        Tracked but excluded from productivity score — neither productive nor unproductive.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {classification === "unproductive" && (
                                            <div className="mt-6 rounded-md bg-gray-100 px-4 py-2.5">
                                                <div className="inline-flex items-center">
                                                    <TiWarningOutline className="w-3.5 h-3.5 mr-2 text-orange-800" />

                                                    <p className="text-sm text-gray-700">
                                                        Log under unproductive time in the Productivity report
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {classification === "blacklisted" && (
                                            <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3">
                                                <div className="inline-flex items-center">
                                                    <PiUmbrellaDuotone className="w-4 h-4 mr-2 text-red-800" />

                                                    <p className="text-sm text-gray-700">
                                                        Stop tracking when using this application
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === "exclusions" && (
                                    <div className="w-full px-2">

                                        <h2 className="text-sm font-semibold text-gray-900">
                                            Exclusions <span className="font-semibold text-gray-900">(Optional)</span>
                                        </h2>

                                        <div className="mt-6 border-b border-gray-200 flex">

                                            <button
                                                onClick={() => setExclusionTab("teams")}
                                                className={`flex items-center text-sm gap-2 px-2 pb-3 mr-8 border-b-2 transition ${exclusionTab === "teams"
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                <Users className="w-5 h-5" />

                                                <span className="font-medium">
                                                    Team-Based Exclusions
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => setExclusionTab("users")}
                                                className={`flex items-center text-sm gap-2 px-2 pb-3 border-b-2 transition ${exclusionTab === "users"
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                <User className="w-5 h-5" />

                                                <span className="font-medium">
                                                    Individual User Exclusions
                                                </span>
                                            </button>

                                        </div>

                                        {exclusionTab === "teams" && (
                                            <>
                                                <div className="mt-3">

                                                    <div className="flex items-start gap-3">
                                                        <BsInfoCircle className="w-4 h-4 text-blue-800 mt-0.5" />

                                                        <p className="text-xs text-gray-600">
                                                            Exclude entire teams from this tracking rule. Members of
                                                            selected teams will not be affected by this configuration.
                                                        </p>
                                                    </div>

                                                </div>

                                                <div className="mt-6">

                                                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                                                        Search Teams
                                                    </label>

                                                    <div className="relative">

                                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />

                                                        <input
                                                            type="text"
                                                            value={teamSearch}
                                                            onChange={(e) => setTeamSearch(e.target.value)}
                                                            placeholder="Search teams..."
                                                            className="w-full h-10 rounded-md border border-gray-300 pl-12 pr-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />

                                                    </div>

                                                </div>

                                                <div className="mt-5 mb-3 flex items-center justify-between text-sm text-gray-500">
                                                    <span>
                                                        {selectedTeams.length} selected
                                                    </span>

                                                    <span>
                                                        Total: {teams.length} teams
                                                    </span>
                                                </div>

                                                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

                                                    {/* Header */}
                                                    <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3">

                                                        <input
                                                            type="checkbox"
                                                            checked={allTeamsSelected}
                                                            onChange={(e) => toggleSelectAllTeams(e.target.checked)}
                                                            className="h-3.5 w-3.5 rounded border-gray-300"
                                                        />

                                                        <span className="text-sm font-medium text-gray-800">
                                                            Select all {filteredTeams.length} on this page
                                                        </span>

                                                    </div>

                                                    {/* Team rows */}
                                                    {filteredTeams.map((team: any) => (
                                                        <div
                                                            key={team._id}
                                                            className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTeams.includes(team._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedTeams((prev) =>
                                                                            prev.includes(team._id)
                                                                                ? prev
                                                                                : [...prev, team._id]
                                                                        );
                                                                    } else {
                                                                        setSelectedTeams(
                                                                            selectedTeams.filter((id) => id !== team._id)
                                                                        );
                                                                    }
                                                                }}
                                                                className="h-3.5 w-3.5 rounded border-gray-300"
                                                            />

                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {team.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {filteredTeams.length === 0 && (
                                                        <div className="py-10 text-center text-sm text-gray-500">
                                                            No teams found.
                                                        </div>
                                                    )}

                                                </div>
                                            </>
                                        )}

                                        {exclusionTab === "users" && (
                                            <>
                                                <div className="mt-3 flex items-start gap-3">
                                                    <BsInfoCircle className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-blue-600" />

                                                    <p className="text-xs text-gray-600">
                                                        Exclude individual users from this tracking rule. These users will
                                                        not be affected even if they belong to included teams.
                                                    </p>
                                                </div>

                                                <div className="mt-5 grid grid-cols-2 gap-4">

                                                    <div>
                                                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                                                            Search Users
                                                        </label>

                                                        <div className="relative">

                                                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                                            <input
                                                                value={userSearch}
                                                                onChange={(e) => setUserSearch(e.target.value)}
                                                                placeholder="Search by name or email..."
                                                                className="h-10 w-full rounded-md border border-gray-300 pl-12 pr-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            />

                                                        </div>
                                                    </div>

                                                    <div>

                                                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                                                            Filter by Team
                                                        </label>

                                                        <select
                                                            value={selectedTeamFilter}
                                                            onChange={(e) => setSelectedTeamFilter(e.target.value)}
                                                            className="h-10 w-full rounded-md border border-gray-300 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        >
                                                            <option value="all">All Teams</option>

                                                            {teams.map((team: any) => (
                                                                <option key={team._id} value={team._id}>
                                                                    {team.name}
                                                                </option>
                                                            ))}
                                                        </select>



                                                    </div>

                                                </div>

                                                <div className="mt-6 mb-3 flex items-center justify-between text-sm text-gray-500">
                                                    <span>
                                                        {selectedUsers.length} selected
                                                    </span>

                                                    <span>
                                                        Total: {filteredUsers.length} users
                                                    </span>
                                                </div>
                                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">


                                                    {/* Header */}
                                                    <div className="flex items-center border-b border-gray-200 bg-gray-50 px-5 py-3">

                                                        <div className="w-12">
                                                            <input
                                                                type="checkbox"
                                                                checked={allUsersSelected}
                                                                onChange={(e) => toggleSelectAllUsers(e.target.checked)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        </div>

                                                        <div className="flex-1 text-sm font-semibold text-gray-700">
                                                            User
                                                        </div>

                                                        <div className="w-56 text-sm font-semibold text-gray-700">
                                                            Team
                                                        </div>

                                                    </div>

                                                    {/* Rows */}
                                                    {loadingUsers ? (
                                                        <div className="py-10 text-center text-sm text-gray-500">
                                                            Loading users...
                                                        </div>
                                                    ) : filteredUsers.length === 0 ? (
                                                        <div className="py-10 text-center text-sm text-gray-500">
                                                            No users found.
                                                        </div>
                                                    ) : (
                                                        filteredUsers.map((user: any) => (
                                                            <div
                                                                key={user._id}
                                                                onClick={() => {
                                                                    setSelectedUsers((prev) =>
                                                                        prev.includes(user._id)
                                                                            ? prev.filter((id) => id !== user._id)
                                                                            : [...prev, user._id]
                                                                    );
                                                                }}
                                                                className="flex cursor-pointer items-center border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50 last:border-b-0"
                                                            >
                                                                <div className="w-12">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedUsers.includes(user._id)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedUsers((prev) =>
                                                                                    prev.includes(user._id)
                                                                                        ? prev
                                                                                        : [...prev, user._id]
                                                                                );
                                                                            } else {
                                                                                setSelectedUsers((prev) =>
                                                                                    prev.filter((id) => id !== user._id)
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="h-4 w-4 rounded border-gray-300"
                                                                    />
                                                                </div>

                                                                <div className="flex flex-1 items-center gap-3">
                                                                    {user.avatar ? (
                                                                        <img
                                                                            src={user.avatar}
                                                                            alt={user.firstName}
                                                                            className="h-10 w-10 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                                                                            {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">
                                                                            {user.firstName} {user.lastName}
                                                                        </p>

                                                                        <p className="text-sm text-gray-500">
                                                                            {user.email}
                                                                        </p>
                                                                    </div>

                                                                </div>

                                                                <div className="w-56 text-sm text-gray-600">
                                                                    {user.team?.name || "-"}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </>
                                        )}

                                    </div>
                                )}
                            </div>

                        </div>

                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-8 py-5 flex justify-end bg-white">
                        <button
                            onClick={handleCreate}
                            disabled={!appName.trim()}
                            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${appName.trim()
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "bg-indigo-200 text-white cursor-not-allowed"
                                }`}
                        >
                            <Check className="w-4 h-4" />
                            {editingApp ? "Update App Configuration" : "Create App Application"}
                        </button>
                    </div>

                </div>
            </div>
        </div>

    );
}