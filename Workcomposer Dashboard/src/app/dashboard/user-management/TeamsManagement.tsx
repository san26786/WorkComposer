"use client";

import Papa from "papaparse";
import React, { useCallback, useEffect, useState } from 'react'
import API from "@/api";
import toast from "react-hot-toast";
import { useSearchParams } from 'next/navigation';
import { Search, Check, ChevronDown, Download, Upload, Mail, SendHorizontal, Archive, CircleCheck, SearchAlert } from 'lucide-react';
import { TbSelector } from "react-icons/tb";
import UserProfileTrigger from "@/components/UserProfileTrigger";
import { HiUserAdd } from "react-icons/hi";
import { HiArrowUturnUp } from "react-icons/hi2";
import { HiMiniUsers } from "react-icons/hi2";
import { CiUser } from "react-icons/ci";
import { FaUsers } from "react-icons/fa";
import { GoShieldCheck } from "react-icons/go";
import { IoIosMenu } from "react-icons/io";
import { CiDesktop } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi2";
import AddUsers from './AddUsers';
import EditUserModal from './EditUserModal';
import ArchiveUserModal from './ArchiveUserModal';
import DeviceModal from './DeviceModal';
import UserManager from './UserManager';
import UserProfileModal from "@/components/UserProfilemodal";

type TeamsManagementProps = {
    selectedTeam?: string;
};

export default function TeamsManagement({
    selectedTeam,
}: TeamsManagementProps) {

    const [openDropDown, setOpenDropDown] = useState<{
        type: string;
        id: string;
    } | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const usersPerPage = 10;
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [editingManagerId, setEditingManagerId] = useState<string | null>(null);
    const [selectedManager, setSelectedManager] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState("");

    const searchParams = useSearchParams();

    const currentTeam =
        selectedTeam ??
        searchParams.get("team") ??
        "All Teams";


    const managers = Array.isArray(users)
        ? users.filter(
            (u: any) =>
                u.role?.toLowerCase() === "manager" ||
                u.role?.toLowerCase() === "owner"
        ) : [];

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest(".dropdown")) {
                setOpenDropDown(null);
                setUserMenuOpen(false);
                setFilterOpen(false);
                setExportOpen(false);
            }
        };

        window.addEventListener("click", handleClick);
        return () =>
            window.removeEventListener("click", handleClick);
    }, []);



    const fetchUsers = useCallback(async () => {

        try {

            setLoading(true);

            const res = await API.get(
                "/users/all-users",
                {
                    params: {
                        page: currentPage,
                        limit: 5,
                        search: searchTerm,
                        role: selectedRole,
                        team: currentTeam !== "All Teams" ? currentTeam : undefined,
                    },
                }
            );

            setCurrentUser(res.data.currentUser);

            setUsers(
                Array.isArray(res.data.users)
                    ? res.data.users
                    : []
            );
            setTotalPages(
                res.data.totalPages
            );
            setTotalUsers(
                res.data.totalUsers
            );

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }


    }, [
        currentPage,
        searchTerm,
        selectedRole,
        currentTeam
    ]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleResendInvite = async (id: string) => {
        try {
            await API.post("/users/resend-invite", { id });

            toast.success("Invite resent successfully");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to resend invite")
        }
    }

    const handleDeleteUser = async (id: string) => {
        try {
            await API.delete(`/users/${id}`, {
                data: {
                    email: deleteEmail.trim(),
                },
            });

            setUsers((prev: any) =>
                prev.filter((user: any) =>
                    (user._id || user.id) !== id
                )
            );

            setTotalUsers((prev: number) => prev - 1);
            setTotalPages(Math.ceil((totalUsers - 1) / 5));

            // Close and reset delete confirmation
            setShowDeleteModal(false);
            setDeleteEmail("");
            setSelectedUser(null);
            setOpenDropDown(null);

            toast.success("User deleted successfully");

        } catch (err: any) {
            console.error(err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };

    const startUser = totalUsers === 0 ? 0 : (currentPage - 1) * 5 + 1;
    const endUser = Math.min(currentPage * 5, totalUsers);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedRole, currentTeam]);

    const handleUpdateRole = async (
        id: string,
        role: string,
        status?: string
    ) => {

        try {

            if (status === "invited") {

                await API.put(
                    `/users/invite/${id}/role`,
                    { role }
                );

            } else {

                await API.put(
                    `/users/${id}/role`,
                    { role }
                );
            }

            setUsers((prev: any) =>
                prev.map((user: any) =>
                    (user._id || user.id) === id
                        ? {
                            ...user,
                            role,
                        }
                        : user
                )
            );

            setOpenDropDown(null);

        } catch (err) {

            console.error(err);
        }
    };

    const handleAssignManager = async (userId: string) => {

        try {

            if (!selectedManager) {
                toast.error("Select manager");
                return;
            }

            await API.put(
                `/users/${userId}/assign-manager`,
                {
                    managerId: selectedManager,
                }
            );

            setUsers((prev: any) =>
                prev.map((u: any) =>
                    (u._id || u.id) === userId
                        ? {
                            ...u,
                            manager: selectedManager,
                        }
                        : u
                )
            );

            setEditingManagerId(null);
            setSelectedManager("");

            toast.success("Manager assigned");

        } catch (err) {

            console.error(err);
            toast.error("Failed to assign manager");
        }
    };

    const handleUnarchiveUser = async (id: string) => {

        try {

            await API.put(`/users/${id}/unarchive`);

            setUsers((prev: any) =>
                prev.map((u: any) =>
                    (u._id || u.id) === id
                        ? {
                            ...u,
                            isArchived: false,
                            status: "active",
                        }
                        : u
                )
            );

            toast.success("User unarchived successfully");

        } catch (err: any) {

            console.error(err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to unarchive user"
            );
        }
    };

    const handleExportUsers = async () => {
        try {

            const res = await API.get(
                "/users/export-users",
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([res.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                "workcomposer.users.csv"
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

        } catch (err) {
            toast.error("Export failed");
        }
    };

    const handleImportUsers = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) return;

        Papa.parse(file, {
            header: true,

            skipEmptyLines: true,

            complete: async (results: any) => {

                try {
                    const users = results.data;

                    const formattedUsers = users.map(
                        (user: any) => ({
                            email: user.email,
                            role:
                                user.role?.toLowerCase() || "user",
                            team:
                                user.team || "Default team",
                        })
                    );

                    await API.post(
                        "/users/import-users",
                        {
                            users: formattedUsers,
                        }
                    );
                    toast.success(
                        "Users imported successfully"
                    );

                    fetchUsers();

                } catch (err) {
                    toast.error("Import failed");
                }
            },
        });
    };

    const latestDevice = selectedUser?.devices?.length
        ? [...selectedUser.devices].sort(
            (a: any, b: any) =>
                new Date(b.lastSync).getTime() -
                new Date(a.lastSync).getTime()
        )[0]
        : null;

    return (
        <>
            <div className='py-6 flex-1'>
                <div className='mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8'>
                    <div className='mb-3'>
                        <h1 className='text-2xl font-bold text-gray-900'>User Management</h1>
                    </div>

                    <div className='bg-white rounded-lg shadow-sm'>
                        <div className='bg-white border-b border-gray-200 shadow-sm'>
                            <div className='px-4 py-4 sm:px-6 lg:px-8'>
                                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto min-w-0'>
                                        <div className='relative w-full sm:w-64 lg:w-72 xl:w-80'>
                                            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                                                <Search className='h-5 w-5 text-gray-400' />
                                            </div>

                                            <input
                                                id='search-user'
                                                type='text'
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(e.target.value)
                                                }
                                                placeholder='Search users...'
                                                aria-label='Search users'
                                                className='block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm'></input>
                                        </div>
                                        <div className='relative w-full sm:w-auto sm:min-w-[140px] dropdown'>
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                setFilterOpen(!filterOpen)
                                            }}
                                                type='button' aria-haspopup='listbox' aria-expanded={filterOpen ? 'true' : 'false'} aria-label="Filter users by role" className='relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 sm:text-sm'>
                                                <span className='block truncate'>{selectedRole}</span>
                                                <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                                                    <TbSelector className='h-5 w-5 text-gray-400' />
                                                </span>
                                            </button>
                                            {filterOpen && (
                                                <ul aria-orientation='vertical' role='listbox' className='absolute z-10 mt-1 max-h-60 w-full min-w-[200px] max-w-[280px] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm left-0 origin-top-left'>

                                                    {[
                                                        "All Roles",
                                                        "User",
                                                        "Manager",
                                                        "Admin",
                                                        "Owner"
                                                    ].map((role) => (

                                                        <li
                                                            key={role}
                                                            onClick={() => {
                                                                setSelectedRole(role);
                                                                setFilterOpen(false);
                                                            }}
                                                            className='text-gray-900 relative cursor-pointer select-none py-2 pl-3 pr-9' role='option' aria-selected={selectedRole === role}>
                                                            <span className={`font-medium block truncate ${selectedRole === role ? "font-medium" : "font-normal"}`}>{role}</span>

                                                            {selectedRole === role && (
                                                                <span className='text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4'>
                                                                    <Check className='w-5 h-5' />
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div className='flex flex-wrap items-center gap-2 mt-3 sm:mt-0 sm:flex-shrink-0'>

                                        <button onClick={() =>
                                            setShowAddModal(true)
                                        }
                                            className='inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
                                            <HiUserAdd className='h-5 w-5' />
                                            <span>Add user</span>
                                        </button>

                                        <div className='flex items-center gap-2'>
                                            <div className='relative dropdown'>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUserMenuOpen(!userMenuOpen)
                                                }}
                                                    type='button' aria-haspopup='menu' aria-expanded={userMenuOpen ? 'true' : 'false'} className='inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
                                                    <span>Users</span>
                                                    <ChevronDown className='h-4 w-4 text-gray-500' />
                                                </button>
                                                {userMenuOpen && (
                                                    <div role='menu' className='absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 md:left-0 md:origin-top-left'>
                                                        <button
                                                            onClick={handleExportUsers}
                                                            className='text-gray-700 flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-gray-100' role='menuitem'>
                                                            <Download className='w-5 h-5 text-gray-500' />
                                                            Export
                                                        </button>

                                                        <label className='text-gray-700 flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-gray-100' role='menuitem'>
                                                            <Upload className='w-5 h-5 text-gray-500' />
                                                            Import

                                                            <input
                                                                type="file"
                                                                accept=".csv"
                                                                hidden
                                                                onChange={handleImportUsers}
                                                            ></input>
                                                        </label>

                                                    </div>
                                                )}
                                            </div>

                                            <div className='relative dropdown'>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExportOpen(!exportOpen)
                                                }}
                                                    type='button' aria-haspopup='menu' aria-expanded={exportOpen} className='inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
                                                    <span>Export</span>
                                                    <ChevronDown className='h-4 w-4 text-gray-500' />
                                                </button>
                                                {exportOpen && (
                                                    <div role='menu' className='absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 md:left-0 md:origin-top-left'>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await API.get("/users/export/users", {
                                                                        responseType: "blob",
                                                                    }
                                                                    );

                                                                    const url = window.URL.createObjectURL(
                                                                        new Blob([res.data])
                                                                    );

                                                                    const link = document.createElement("a");

                                                                    link.href = url;

                                                                    link.setAttribute(
                                                                        "download",
                                                                        "users.csv"
                                                                    );

                                                                    document.body.appendChild(link);

                                                                    link.click();

                                                                    link.remove();

                                                                } catch (err) {
                                                                    console.error(err);
                                                                }
                                                            }}
                                                            className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100' role='menuitem'>Users</button>
                                                        <button
                                                            onClick={async () => {
                                                                try {

                                                                    const res = await API.get(
                                                                        "/users/export/hierarchy-users",
                                                                        {
                                                                            responseType: "blob",
                                                                        }
                                                                    );

                                                                    const url = window.URL.createObjectURL(
                                                                        new Blob([res.data])
                                                                    );

                                                                    const link = document.createElement("a");

                                                                    link.href = url;

                                                                    link.setAttribute(
                                                                        "download",
                                                                        "hierarchy-users.csv"
                                                                    );

                                                                    document.body.appendChild(link);

                                                                    link.click();

                                                                    link.remove();

                                                                } catch (err) {

                                                                    toast.error("Failed to export hierarchy users");
                                                                }
                                                            }}
                                                            className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100'
                                                            role='menuitem'
                                                        >
                                                            Hierarchy (Users)
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {

                                                                    const res = await API.get(
                                                                        "/users/export/hierarchy-managers",
                                                                        {
                                                                            responseType: "blob",
                                                                        }
                                                                    );

                                                                    const url = window.URL.createObjectURL(
                                                                        new Blob([res.data])
                                                                    );

                                                                    const link = document.createElement("a");

                                                                    link.href = url;

                                                                    link.setAttribute(
                                                                        "download",
                                                                        "hierarchy-managers.csv"
                                                                    );

                                                                    document.body.appendChild(link);

                                                                    link.click();

                                                                    link.remove();

                                                                } catch (err) {



                                                                    toast.error("Failed to export managers hierarchy");
                                                                }
                                                            }}
                                                            className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100'
                                                            role='menuitem'
                                                        >
                                                            Hierarchy (Managers)
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {

                                                                    const res = await API.get(
                                                                        "/users/export/devices",
                                                                        {
                                                                            responseType: "blob",
                                                                        }
                                                                    );

                                                                    const url = window.URL.createObjectURL(
                                                                        new Blob([res.data])
                                                                    );

                                                                    const link = document.createElement("a");

                                                                    link.href = url;

                                                                    link.setAttribute(
                                                                        "download",
                                                                        "devices.csv"
                                                                    );

                                                                    document.body.appendChild(link);

                                                                    link.click();

                                                                    link.remove();

                                                                } catch (err) {



                                                                    toast.error("Failed to export devices");
                                                                }
                                                            }}
                                                            className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100'
                                                            role='menuitem'
                                                        >
                                                            Devices
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='divide-y divide-gray-200'>
                            <div>
                                <div>
                                    <div className='overflow-x-auto'>
                                        <table className='min-w-full table-fixed divide-y divide-gray-200' aria-label='User table'>
                                            <caption className='sr-only'>List of users in the organization</caption>
                                            <thead className='bg-gray-50 sticky top-0 shadow-sm border-b border-gray-200'>
                                                <tr>
                                                    <th scope='col' className='w-2/5 sm:w-1/3 py-3 pr-3 pl-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>User</th>
                                                    <th scope='col' className='w-1/4 px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell'>Team</th>
                                                    <th scope='col' className='w-1/4 px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Role</th>
                                                    <th scope='col' className='w-1/6 px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell'>Status</th>
                                                    <th scope='col' className='py-3 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell'>Invite Expiry</th>
                                                    <th scope='col' className='w-20 py-3 pr-6 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody className='divide-y divide-gray-200 bg-white'>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={6} className='py-10 text-center text-gray-500'>
                                                            Loading users...
                                                        </td>
                                                    </tr>
                                                ) : users.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className='py-10 text-center text-gray-500'>
                                                            No users found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    Array.isArray(users) &&
                                                    users.map((user: any) => {
                                                        const userId = user._id || user.id;
                                                        return (

                                                            <tr
                                                                key={userId}

                                                                className='hover:bg-gray-50 transition-colors duration-150'
                                                            >

                                                                {/* USER */}
                                                                <td className="py-5 pl-6 max-w-xs">
                                                                    <div className="flex items-center min-w-0">

                                                                        {/* Avatar */}
                                                                        <UserProfileTrigger
                                                                            user={user}
                                                                            className="shrink-0 cursor-pointer"
                                                                        >
                                                                            {user?.avatar ? (
                                                                                <img
                                                                                    src={user.avatar}
                                                                                    alt={`${user.firstName} ${user.lastName}`}
                                                                                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover hover:ring-2 hover:ring-indigo-400 transition"
                                                                                />
                                                                            ) : (
                                                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold uppercase hover:ring-2 hover:ring-indigo-400 transition">
                                                                                    {user?.email?.charAt(0)}
                                                                                </div>
                                                                            )}
                                                                        </UserProfileTrigger>

                                                                        {/* Name + Email */}
                                                                        <UserProfileTrigger
                                                                            user={user}
                                                                            className="ml-4 min-w-0 text-left cursor-pointer"
                                                                        >
                                                                            <div className="text-sm font-medium text-gray-900 truncate hover:text-indigo-600">
                                                                                {user.firstName
                                                                                    ? `${user.firstName} ${user.lastName}`
                                                                                    : "Pending User"}
                                                                            </div>

                                                                            <div className="text-sm text-gray-500 truncate">
                                                                                {user.email}
                                                                            </div>
                                                                        </UserProfileTrigger>

                                                                    </div>
                                                                </td>

                                                                {/* TEAM */}
                                                                <td className='py-5 px-3 text-sm hidden sm:table-cell'>
                                                                    <div className='flex items-center'>
                                                                        <HiMiniUsers className='h-4 w-4 mr-1.5 text-gray-500' />
                                                                        <span>{user.team || "Default team"}</span>
                                                                    </div>
                                                                </td>

                                                                {/* ROLE */}
                                                                <td className='py-5 px-3 text-sm'>
                                                                    <div className='flex flex-col gap-1'>

                                                                        <div className='flex items-center gap-2'>

                                                                            {user.role?.toLowerCase() === "owner" ||
                                                                                (user.role?.toLowerCase() === "admin" &&
                                                                                    currentUser?.role?.toLowerCase() !== "owner")
                                                                                ?
                                                                                (
                                                                                    <span className='inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700'>
                                                                                        <GoShieldCheck className='h-4 w-4 mr-1' />
                                                                                        {user.role}
                                                                                    </span>
                                                                                ) : currentUser?.role?.toLowerCase() === "owner" ||
                                                                                    currentUser?.role?.toLowerCase() === "admin" ? (

                                                                                    <div className='relative dropdown inline-block text-left'>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();

                                                                                                setOpenDropDown(
                                                                                                    openDropDown?.type === "role" &&
                                                                                                        openDropDown?.id === userId
                                                                                                        ? null
                                                                                                        : {
                                                                                                            type: "role",
                                                                                                            id: userId,
                                                                                                        }
                                                                                                );
                                                                                            }}
                                                                                            type='button'
                                                                                            className='inline-flex cursor-pointer items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-100 shadow-sm'
                                                                                        >
                                                                                            <CiUser className='h-4 w-4 mr-1' />
                                                                                            {user.role}
                                                                                            <ChevronDown className='h-4 w-4 ml-1 text-indigo-400' />
                                                                                        </button>

                                                                                        {openDropDown?.type === "role" &&
                                                                                            openDropDown?.id === userId && (
                                                                                                <div className='absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black/5 z-20'>

                                                                                                    <button
                                                                                                        onClick={() =>
                                                                                                            handleUpdateRole(
                                                                                                                userId,
                                                                                                                "user",
                                                                                                                user.status
                                                                                                            )
                                                                                                        }
                                                                                                        className='cursor-pointer flex items-center justify-between w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                                                                                                    >
                                                                                                        <div className='flex items-center gap-2'>
                                                                                                            <CiUser className='h-4 w-4' />
                                                                                                            User
                                                                                                        </div>

                                                                                                        {user.role?.toLowerCase() === "user" && (
                                                                                                            <Check className='h-4 w-4' />
                                                                                                        )}
                                                                                                    </button>

                                                                                                    <button
                                                                                                        onClick={() =>
                                                                                                            handleUpdateRole(
                                                                                                                userId,
                                                                                                                "manager",
                                                                                                                user.status
                                                                                                            )
                                                                                                        }
                                                                                                        className='cursor-pointer flex items-center justify-between w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                                                                                                    >
                                                                                                        <div className='flex items-center gap-2'>
                                                                                                            <FaUsers className='h-4 w-4' />
                                                                                                            Manager
                                                                                                        </div>

                                                                                                        {user.role?.toLowerCase() === "manager" && (
                                                                                                            <Check className='h-4 w-4' />
                                                                                                        )}
                                                                                                    </button>

                                                                                                    <button
                                                                                                        onClick={() =>
                                                                                                            handleUpdateRole(
                                                                                                                userId,
                                                                                                                "admin",
                                                                                                                user.status
                                                                                                            )
                                                                                                        }
                                                                                                        className='cursor-pointer flex items-center justify-between w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                                                                                                    >
                                                                                                        <div className='flex items-center gap-2'>
                                                                                                            <GoShieldCheck className='h-4 w-4' />
                                                                                                            Admin
                                                                                                        </div>

                                                                                                        {user.role?.toLowerCase() === "admin" && (
                                                                                                            <Check className='h-4 w-4' />
                                                                                                        )}
                                                                                                    </button>
                                                                                                </div>
                                                                                            )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className='inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700'>
                                                                                        <GoShieldCheck className='h-4 w-4 mr-1' />
                                                                                        {user.role}
                                                                                    </span>
                                                                                )}


                                                                            {user.role?.toLowerCase() === "manager" &&
                                                                                (currentUser?.role?.toLowerCase() === "owner" ||
                                                                                    currentUser?.role?.toLowerCase() === "admin") && (
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setSelectedUser(user);
                                                                                            setEditingManagerId(userId);
                                                                                        }}
                                                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                                                                    >
                                                                                        Edit
                                                                                    </button>
                                                                                )}
                                                                        </div>

                                                                        {/* MANAGER STATS */}

                                                                        {user.role?.toLowerCase() === "manager" && (
                                                                            <p className='text-xs text-gray-500 ml-1'>
                                                                                managing {user.managedUsersCount || 0} user(s),{" "}
                                                                                {user.managedTeamsCount || 0} team(s)
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>


                                                                {/* STATUS */}
                                                                <td className='py-5 px-3 text-sm hidden md:table-cell'>
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "invited"
                                                                            ? "bg-yellow-100 text-yellow-800" : user.status === "archived" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                                                            }`}
                                                                    >

                                                                        <CircleCheck className='h-3.5 w-3.5' />
                                                                        {user.status === "invited" ? "Invited" : user.status === "archived" ? "Archived" : "Active"}
                                                                    </span>
                                                                </td>

                                                                {/* Expiry */}
                                                                <td className='py-5 px-3 text-sm hidden lg:table-cell'>
                                                                    {user.status === "invited" ? (
                                                                        <span className='text-yellow-700 font-medium'>
                                                                            {new Date(
                                                                                user.expireAt
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    ) : (
                                                                        <span className='text-gray-400'>-</span>
                                                                    )}
                                                                </td>

                                                                {/* ACTIONS */}
                                                                <td className='py-5 pr-6 text-right text-sm'>
                                                                    <div className='flex items-center justify-end gap-1.5'>

                                                                        {user.status === "invited" && (
                                                                            <div className='relative'>
                                                                                <button onClick={() => handleResendInvite(userId)}
                                                                                    className='inline-flex items-center gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-2 rounded-md text-xs font-medium border border-yellow-300 hover:border-yellow-400 transition-colors shadow-sm'>
                                                                                    <SendHorizontal className='h-4 w-4' />
                                                                                    <span className='hidden sm:inline'>Resend</span>
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        <div className='relative dropdown'>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();


                                                                                    setOpenDropDown(
                                                                                        openDropDown?.type === "action" &&
                                                                                            openDropDown?.id === userId
                                                                                            ? null
                                                                                            : {
                                                                                                type: "action",
                                                                                                id: userId
                                                                                            }
                                                                                    );
                                                                                }}
                                                                                type='button'
                                                                                className='inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-md text-sm border border-gray-300 transition shadow-sm'
                                                                            >
                                                                                <IoIosMenu className='h-5 w-5' />
                                                                            </button>

                                                                            {openDropDown?.type === "action" &&
                                                                                openDropDown?.id === userId && (
                                                                                    <div className='absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black/5 z-10'>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setSelectedUser(user);
                                                                                                setShowDeviceModal(true);
                                                                                                setOpenDropDown(null);
                                                                                            }}
                                                                                            className='flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700'>
                                                                                            <CiDesktop className='h-5 w-5' />
                                                                                            Device
                                                                                        </button>

                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setSelectedUser(user);
                                                                                                setShowEditModal(true);
                                                                                                setOpenDropDown(null);

                                                                                            }}
                                                                                            className='flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 cursor-pointer'>
                                                                                            <FaRegEdit className='h-5 w-5' />
                                                                                            Edit
                                                                                        </button>

                                                                                        {user.status === "archived" ? (
                                                                                            <button
                                                                                                onClick={() => handleUnarchiveUser(userId)}
                                                                                                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-green-600 cursor-pointer"
                                                                                            >
                                                                                                <HiArrowUturnUp className="h-5 w-5" />
                                                                                                Unarchive
                                                                                            </button>
                                                                                        ) : (
                                                                                            user.role?.toLowerCase() !== "owner" && (
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedUser(user);
                                                                                                        setShowArchiveModal(true);
                                                                                                        setOpenDropDown(null);
                                                                                                    }}
                                                                                                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 cursor-pointer"
                                                                                                >
                                                                                                    <Archive className="h-5 w-5" />
                                                                                                    Archive
                                                                                                </button>
                                                                                            )
                                                                                        )}


                                                                                        {(user.role?.toLowerCase() !== "owner")
                                                                                            &&
                                                                                            (
                                                                                                currentUser?.role === "owner" ||
                                                                                                currentUser?.role === "admin"
                                                                                            ) && (


                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedUser(user);
                                                                                                        setDeleteEmail("");
                                                                                                        setShowDeleteModal(true);
                                                                                                        setOpenDropDown(null);
                                                                                                    }}
                                                                                                    className='flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 cursor-pointer'
                                                                                                >
                                                                                                    <HiOutlineTrash className='h-5 w-5' />
                                                                                                    Delete
                                                                                                </button>
                                                                                            )}
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200'>

                                    <p className='text-sm text-gray-600'>
                                        Showing{" "}
                                        <span className='font-medium'>{startUser}</span>
                                        {" "}to{" "}
                                        <span className='font-medium'>{endUser}</span>
                                        {" "}of{" "}
                                        <span className='font-medium'>{totalUsers}</span>
                                        {" "}users
                                    </p>

                                    <div className='flex items-center gap-2'>

                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(prev - 1, 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className='px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            Previous
                                        </button>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() =>
                                                        setCurrentPage(index + 1)
                                                    }
                                                    className={`px-3 py-1.5 text-sm rounded-md border ${currentPage === index + 1
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(prev + 1, totalPages)
                                                )
                                            }
                                            disabled={currentPage === totalPages}
                                            className='px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            Next
                                        </button>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <AddUsers
                    setShowAddModal={setShowAddModal}
                    setUsers={setUsers}
                    onUserAdded={fetchUsers}
                />
            )}

            {showEditModal && selectedUser && (
                <EditUserModal
                    user={selectedUser}

                    setShowEditModal={setShowEditModal}
                    setUsers={setUsers}
                />
            )}

            {showArchiveModal && selectedUser && (
                <ArchiveUserModal
                    user={selectedUser}

                    setShowArchiveModal={setShowArchiveModal}

                    setUsers={setUsers}
                />
            )}

            {showDeviceModal && selectedUser && (
                <DeviceModal
                    user={selectedUser}

                    setShowDeviceModal={setShowDeviceModal}
                />
            )}

            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <HiOutlineTrash className="h-5 w-5 text-red-600" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Delete user
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        This action cannot be undone. To confirm that you
                                        want to permanently delete this user, enter their
                                        email address below.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <p className="mb-2 text-sm font-medium text-gray-700">
                                    Enter the user&apos;s email:
                                </p>

                                <div className="mb-2 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                                    {selectedUser.email}
                                </div>

                                <input
                                    type="email"
                                    value={deleteEmail}
                                    onChange={(e) => setDeleteEmail(e.target.value)}
                                    placeholder="Enter email to confirm"
                                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm"
                                    autoFocus
                                />

                                {deleteEmail &&
                                    deleteEmail.trim().toLowerCase() !==
                                    selectedUser.email?.trim().toLowerCase() && (
                                        <p className="mt-2 text-xs text-red-600">
                                            Email does not match.
                                        </p>
                                    )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteEmail("");
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        deleteEmail.trim().toLowerCase() !==
                                        selectedUser.email?.trim().toLowerCase()
                                    }
                                    onClick={() => {
                                        handleDeleteUser(
                                            selectedUser._id || selectedUser.id
                                        );
                                    }}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Delete user
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {editingManagerId && (
                <UserManager
                    userId={editingManagerId}
                    onClose={() => {
                        setEditingManagerId(null)
                        fetchUsers();
                    }}
                />
            )}
        </>
    )
}


