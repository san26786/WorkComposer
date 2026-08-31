"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import SettingsLoading from "@/components/settings/SettingsLoading";
import toast from "react-hot-toast";

export default function RolesPage() {

    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [reportAccess, setReportAccess] = useState("none");
    const [screenshotAccess, setScreenshotAccess] = useState("none");
    const [activeTab, setActiveTab] = useState("all");

    const [permissions, setPermissions] = useState({
        manageBilling: false,
        manageSettings: false,
        manageUsers: false,
        manageProjects: true,
        manageTasks: true,
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);

                const { data } = await API.get("/roles");

                setRoles(data);

                const visibleRoles = data.filter(
                    (role: any) => role.name !== "Owner"
                );

                if (visibleRoles.length) {
                    setSelectedRole(visibleRoles[0]);
                }
            } catch (err: any) {
                console.error("ROLES FETCH ERROR:", err);

                toast.error(
                    err.response?.data?.message ||
                    "Failed to load roles and privileges."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        if (!selectedRole) return;

        const permissions = selectedRole.permissions || [];

        setPermissions({
            manageBilling: permissions.includes("manage_billing"),
            manageSettings: permissions.includes("manage_settings"),
            manageUsers: permissions.includes("manage_users"),
            manageProjects: permissions.includes("manage_projects"),
            manageTasks: permissions.includes("manage_tasks"),
        });

        setReportAccess(selectedRole.reportAccess || "none");
        setScreenshotAccess(selectedRole.screenshotAccess || "none");

    }, [selectedRole]);


    const Toggle = ({
        checked,
        onChange,
    }: {
        checked: boolean;
        onChange: () => void;
    }) => (
        <button
            onClick={onChange}
            className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${checked ? "bg-indigo-600" : "bg-gray-300"
                }`}
        >
            <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${checked ? "translate-x-5" : ""
                    }`}
            />
        </button>
    );

    const updateRole = async (
        updatedPermissions = permissions,
        updatedReportAccess = reportAccess,
        updatedScreenshotAccess = screenshotAccess
    ) => {
        if (!selectedRole) return;

        const permissionsArray = [];

        if (updatedPermissions.manageBilling)
            permissionsArray.push("manage_billing");

        if (updatedPermissions.manageSettings)
            permissionsArray.push("manage_settings");

        if (updatedPermissions.manageUsers)
            permissionsArray.push("manage_users");

        if (updatedPermissions.manageProjects)
            permissionsArray.push("manage_projects");

        if (updatedPermissions.manageTasks)
            permissionsArray.push("manage_tasks");

        try {
            const { data } = await API.put(`/roles/${selectedRole._id}`, {
                permissions: permissionsArray,
                reportAccess: updatedReportAccess,
                screenshotAccess: updatedScreenshotAccess,
            });

            const activeCount =
                data.role.permissions.length +
                (data.role.reportAccess !== "none" ? 1 : 0) +
                (data.role.screenshotAccess !== "none" ? 1 : 0);

            setSelectedRole({
                ...data.role,
                permissionCount: activeCount,
            });

            setRoles((prev: any[]) =>
                prev.map((role) =>
                    role._id === data.role._id
                        ? {
                            ...role,
                            permissions: data.role.permissions,
                            reportAccess: data.role.reportAccess,
                            screenshotAccess: data.role.screenshotAccess,
                            permissionCount: activeCount,
                        }
                        : role
                )
            );
            toast.success("Role privileges updated.");

        } catch (err: any) {
            console.error("ROLE UPDATE ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to update role privileges."
            );
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-6">
                <SettingsLoading />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">

            {/* Header */}

            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Roles & Privileges
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage user roles and configure access privileges for your organization
                </p>
            </div>

            {/* Main Card */}

            <div className="h-[calc(100vh-180px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="grid h-full grid-cols-12">

                    {/* Left Panel */}

                    <div className="col-span-3 border-r border-gray-200 bg-white">

                        <div className="p-4 border-b border-gray-100">

                            <h2 className="text-xl font-bold text-gray-900">
                                Roles
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Manage user roles and privileges
                            </p>

                        </div>

                        <div className="p-4 space-y-4">

                            {roles
                                .filter((role) => role.name !== "Owner")
                                .map((role: any) => (

                                    <div
                                        key={role._id}
                                        onClick={async () => {
                                            try {
                                                const { data } = await API.get(`/roles/${role._id}`);
                                                setSelectedRole(data);
                                            } catch (err: any) {
                                                console.error("ROLE DETAILS FETCH ERROR:", err);

                                                toast.error(
                                                    err.response?.data?.message ||
                                                    "Failed to load role details."
                                                );
                                            }
                                        }}
                                        className={`cursor-pointer rounded-xl p-3 transition ${selectedRole?._id === role._id
                                            ? "border-2 border-indigo-500 bg-indigo-50"
                                            : "border border-gray-200 hover:border-gray-300"
                                            }`}
                                    >

                                        <h3 className="text-md font-semibold text-gray-900">
                                            {role.name}
                                        </h3>

                                        <div className="mt-1 flex gap-4 text-sm text-gray-500">
                                            <span>👥 {role.userCount} users</span>
                                            <span>🛡️ {role.permissionCount} active</span>
                                        </div>

                                    </div>

                                ))}

                        </div>

                    </div>

                    {/* Right Panel */}

                    <div className="col-span-9 flex min-h-0 flex-col">

                        <div className="border-b border-gray-200 bg-white px-8 py-4">

                            <h2 className="text-lg font-bold text-gray-900">
                                {selectedRole?.name || "Role"}
                            </h2>

                            <div className="mt-1 flex items-center text-sm gap-4 text-gray-500">

                                <div className="flex items-center gap-2">
                                    <span>👥</span>
                                    <span>
                                        Assigned to {selectedRole?.userCount || 0} users
                                    </span>
                                </div>

                                <span>•</span>

                                <div className="flex items-center gap-2">
                                    <span>🛡️</span>
                                    <span>
                                        {selectedRole?.permissionCount || 0} privileges active
                                    </span>
                                </div>

                            </div>

                        </div>

                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-8 py-4">

                            <h3 className="text-md font-semibold text-gray-900">
                                Privileges
                            </h3>

                            <div className="flex gap-2">

                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`rounded-lg px-4 py-2 ${activeTab === "all"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-gray-600"
                                        }`}
                                >
                                    All
                                </button>

                                <button
                                    onClick={() => setActiveTab("data")}
                                    className={`rounded-lg px-4 py-2 ${activeTab === "data"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-gray-600"
                                        }`}
                                >
                                    Data Access
                                </button>

                                <button
                                    onClick={() => setActiveTab("admin")}
                                    className={`rounded-lg px-4 py-2 ${activeTab === "admin"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-gray-600"
                                        }`}
                                >
                                    Administration
                                </button>

                                <button
                                    onClick={() => setActiveTab("project")}
                                    className={`rounded-lg px-4 py-2 ${activeTab === "project"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-gray-600"
                                        }`}
                                >
                                    Project Management
                                </button>

                            </div>

                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-8">
                            <div className="space-y-4">

                                {/* Data Access */}

                                {(activeTab === "all" || activeTab === "data") && (

                                    <div className="rounded-2xl border border-gray-200 bg-white">

                                        {/* Header */}

                                        <div className="flex items-center justify-between px-6 py-3">

                                            <div>

                                                <h3 className="text-md font-semibold text-gray-900">
                                                    Data Access
                                                </h3>

                                            </div>

                                        </div>

                                        {/* Body */}

                                        <div className="space-y-6 p-6">

                                            {/* Reports */}

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <p className="font-medium text-gray-900">
                                                        Reports
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        Choose which reports this role can access.
                                                    </p>

                                                </div>

                                                <select
                                                    value={reportAccess}
                                                    onChange={(e) => {
                                                        const value = e.target.value;

                                                        setReportAccess(value);
                                                        updateRole(permissions, value, screenshotAccess);
                                                    }}
                                                    className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                >
                                                    <option value="none">No Access</option>
                                                    <option value="own">Only Own Reports</option>

                                                    {selectedRole?.name === "Manager" && (
                                                        <option value="managed">Managing Users</option>
                                                    )}

                                                    <option value="all">All Users Reports</option>
                                                </select>

                                            </div>

                                            {/* screenshots */}

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <p className="font-medium text-gray-900">
                                                        View Screenshots
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        Control which user screenshots this role can view.
                                                    </p>

                                                </div>

                                                <select
                                                    value={screenshotAccess}
                                                    onChange={(e) => {
                                                        const value = e.target.value;

                                                        setScreenshotAccess(value);
                                                        updateRole(permissions, reportAccess, value);
                                                    }}
                                                    className="w-60 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="none">No Access</option>
                                                    <option value="own">Only Own Screenshots</option>

                                                    {selectedRole?.name === "Manager" && (
                                                        <option value="managed">Managing Users</option>
                                                    )}

                                                    <option value="all">All Users Screenshots</option>
                                                </select>

                                            </div>

                                        </div>

                                    </div>

                                )}

                                {(activeTab === "all" || activeTab === "admin") && (

                                    <div className="rounded-2xl border border-gray-200 bg-white">

                                        <div className="px-6 py-4">

                                            <h3 className="text-md font-semibold text-gray-900">
                                                Administration
                                            </h3>

                                        </div>

                                        <div className="divide-y divide-gray-200">

                                            {/* Billing */}

                                            <div className="flex items-center justify-between px-6 py-6">

                                                <div>

                                                    <h4 className="text-md font-semibold text-gray-900">
                                                        Manage Billing
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        View and manage billing information and payment methods
                                                    </p>

                                                </div>

                                                <Toggle
                                                    checked={permissions.manageBilling}
                                                    onChange={() => {
                                                        const updated = {
                                                            ...permissions,
                                                            manageBilling: !permissions.manageBilling,
                                                        };

                                                        setPermissions(updated);
                                                        updateRole(updated);
                                                    }}
                                                />

                                            </div>

                                            {/* Settings */}

                                            <div className="flex items-center justify-between px-6 py-6">

                                                <div>

                                                    <h4 className="text-md font-semibold text-gray-900">
                                                        Manage Settings
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        View and modify organization settings and preferences
                                                    </p>

                                                </div>

                                                <Toggle
                                                    checked={permissions.manageSettings}
                                                    onChange={() => {
                                                        const updated = {
                                                            ...permissions,
                                                            manageSettings: !permissions.manageSettings,
                                                        };

                                                        setPermissions(updated);
                                                        updateRole(updated);
                                                    }}
                                                />

                                            </div>

                                            {/* Users */}

                                            <div className="flex items-center justify-between px-6 py-6">

                                                <div>

                                                    <h4 className="text-md font-semibold text-gray-900">
                                                        Manage Users & Teams
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Add, edit, and remove users and teams from the organization
                                                    </p>

                                                </div>

                                                <Toggle
                                                    checked={permissions.manageUsers}
                                                    onChange={() => {
                                                        const updated = {
                                                            ...permissions,
                                                            manageUsers: !permissions.manageUsers,
                                                        };

                                                        setPermissions(updated);
                                                        updateRole(updated);
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    </div>
                                )}

                                {(activeTab === "all" || activeTab === "project") && (

                                    <div className="rounded-2xl border border-gray-200 bg-white">

                                        <div className="px-6 py-4">

                                            <h3 className="text-md font-semibold text-gray-900">
                                                Project Management
                                            </h3>

                                        </div>

                                        <div className="divide-y divide-gray-200">

                                            <div className="flex items-center justify-between px-6 py-6">

                                                <div>

                                                    <h4 className="text-md font-semibold text-gray-900">
                                                        Manage Projects
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Allow creating, editing and deleting projects.
                                                    </p>

                                                </div>

                                                <Toggle
                                                    checked={permissions.manageProjects}
                                                    onChange={() => {
                                                        const updated = {
                                                            ...permissions,
                                                            manageProjects: !permissions.manageProjects,
                                                        };

                                                        setPermissions(updated);
                                                        updateRole(updated);
                                                    }}
                                                />

                                            </div>

                                            <div className="flex items-center justify-between px-6 py-6">

                                                <div>

                                                    <h4 className="text-md font-semibold text-gray-900">
                                                        Manage Tasks
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Allow creating, editing and deleting tasks.
                                                    </p>

                                                </div>

                                                <Toggle
                                                    checked={permissions.manageTasks}
                                                    onChange={() => {
                                                        const updated = {
                                                            ...permissions,
                                                            manageTasks: !permissions.manageTasks,
                                                        };

                                                        setPermissions(updated);
                                                        updateRole(updated);
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}