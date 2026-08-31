"use client"

import { useEffect, useRef, useState } from "react";
import API from "@/api";
import { User, Check, Clock3, CircleCheck, Waypoints } from 'lucide-react';
import { ChevronsUpDown } from 'lucide-react';
import { HiOutlineFilter } from "react-icons/hi";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { LuMessageSquareText } from "react-icons/lu";
import { IoDocumentTextOutline } from "react-icons/io5";
import { TbCircleX } from "react-icons/tb";
import RejectRequestModal from "@/app/components/RejectRequestModal";
import { useDashboard } from "@/context/DashboardContext";
import { getAvatarUrl } from "@/utils/avatar";
import toast from "react-hot-toast";

type Props = {
    desktop?: boolean;
};

const Inbox = ({
    desktop = false,
}: Props) => {

    const [requests, setRequests] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [requestStatus, setRequestStatus] = useState("pending");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUsers, setShowUsers] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

    const userDropdownRef = useRef<HTMLDivElement>(null);

    const { user } = useDashboard();

    const getUserInitials = (firstName = "", lastName = "") => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`
            .toUpperCase();
    };

    const canApprove =
        user?.role === "owner" ||
        user?.role === "admin" ||
        user?.role === "manager";

    const fetchRequests = async () => {
        try {
            const { data } = await API.get("/manual-time-requests", {
                params: {
                    status: requestStatus,
                }
            });

            setRequests(data);
        } catch (err) {
            console.error(err);
        }
    };

    const approveRequest = async (id: string) => {
        try {
            await API.patch(`/manual-time-requests/${id}/approve`);

            await fetchRequests();

            window.dispatchEvent(
                new Event("refreshInboxCount")
            );
        } catch (err: any) {
            console.error("APPROVE REQUEST ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to approve manual time request."
            );
        }
    };



    const filteredRequests = requests.filter((request: any) => {

        if (
            selectedUser &&
            request.requestedBy._id !== selectedUser._id
        ) {
            return false;
        }

        const name =
            `${request.requestedBy.firstName} ${request.requestedBy.lastName}`.toLowerCase();

        const team =
            request.requestedBy.team?.name?.toLowerCase() || "";

        return (
            name.includes(search.toLowerCase()) ||
            team.includes(search.toLowerCase())
        );
    });

    const fetchUsers = async () => {
        try {
            const { data } = await API.get("/users");

            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [requestStatus]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user: any) => {
        const name =
            `${user.firstName} ${user.lastName}`.toLowerCase();

        return name.includes(searchUser.toLowerCase());
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(
                    event.target as Node
                )
            ) {
                setShowUsers(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const approveSelected = async () => {
        try {
            await Promise.all(
                selectedRequests.map((id) =>
                    API.patch(`/manual-time-requests/${id}/approve`)
                )
            );

            setSelectedRequests([]);

            fetchRequests();

            window.dispatchEvent(
                new Event("refreshInboxCount")
            );

        } catch (err) {
            console.error(err);
        }
    };


    return (
        <>
            <div
                className={`flex-1 ${desktop
                    ? "bg-white"
                    : "bg-gray-100"
                    }`}
            >
                <div
                    className={
                        desktop
                            ? "py-6"
                            : "py-4 lg:py-6"
                    }
                >
                    <div className='px-4 sm:px-6 lg:px-8'>


                        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <div className='mb-4'>
                                    <h2 className='text-base font-bold text-gray-900 mb-1'>Filter & Search</h2>
                                    <p className='text-xs text-gray-500'>Refine your view to find specific requests</p>
                                </div>
                                <div className='flex flex-col lg:flex-row gap-4'>
                                    <div className='w-full lg:w-1/3'>
                                        <div>
                                            <label htmlFor="" className='block text-sm font-medium text-gray-500 mb-1 flex items-center'>
                                                <User className='h-4 w-4 mr-1 text-indigo-600' />
                                                Search User
                                            </label>
                                            <div
                                                ref={userDropdownRef}
                                                className="relative"
                                            >
                                                <input
                                                    value={searchUser}
                                                    onFocus={() => {
                                                        if (!showUsers) {
                                                            setShowUsers(true);
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        setSearchUser(e.target.value);
                                                        setShowUsers(true);
                                                    }}
                                                    aria-expanded="true"
                                                    aria-autocomplete="list"
                                                    type="text"
                                                    role="combobox"
                                                    className="block w-full bg-white rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                                                    placeholder="All Users or Type a Name..."
                                                />
                                                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                                                    <User className='h-4 w-4 text-indigo-600' />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowUsers((prev) => !prev)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                >
                                                    <ChevronsUpDown className="h-4 w-4 text-gray-500 hover:text-indigo-600 transition-colors duration-200" />
                                                </button>
                                                {showUsers && (
                                                    <ul
                                                        role="listbox"
                                                        className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-gray-200 border border-gray-300"
                                                    >
                                                        <li
                                                            onClick={() => {
                                                                setSelectedUser(null);
                                                                setSearchUser("");
                                                                setShowUsers(false);
                                                            }}
                                                            className="cursor-pointer py-2 pl-3 pr-8 hover:bg-gray-100"
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                                                                    <User className="h-3 w-3 text-gray-500" />
                                                                </div>

                                                                <span className="ml-2 font-semibold">
                                                                    All Users
                                                                </span>
                                                            </div>
                                                        </li>

                                                        {filteredUsers.map((user: any) => (
                                                            <li
                                                                key={user._id}
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setSearchUser(
                                                                        `${user.firstName} ${user.lastName}`
                                                                    );
                                                                    setShowUsers(false);
                                                                }}
                                                                className="cursor-pointer py-2 pl-3 pr-8 hover:bg-gray-100"
                                                            >
                                                                <div className="flex items-center">
                                                                    <img
                                                                        src={user.avatar}
                                                                        className="h-7 w-7 rounded-full object-cover"
                                                                    />

                                                                    <span className="ml-2 font-medium">
                                                                        {user.firstName} {user.lastName}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='w-full lg:w-1/3'>
                                        <label htmlFor="" className='block text-sm font-medium text-gray-500 mb-1 flex items-center'>
                                            <HiOutlineFilter className='h-4 w-4 mr-1 text-indigo-600' />
                                            Status Filter
                                        </label>
                                        <div className='flex space-x-2'>
                                            <button
                                                onClick={() => setRequestStatus("pending")}
                                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${requestStatus === "pending"
                                                    ? "bg-indigo-600 text-white border border-indigo-600"
                                                    : "bg-white text-gray-600 border border-gray-300 hover:border-indigo-500"
                                                    }`}
                                            >
                                                Pending
                                            </button>
                                            <button
                                                onClick={() => setRequestStatus("all")}
                                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${requestStatus === "all"
                                                    ? "bg-indigo-600 text-white border border-indigo-600"
                                                    : "bg-white text-gray-600 border border-gray-300 hover:border-indigo-500"
                                                    }`}
                                            >
                                                All
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                {canApprove && selectedRequests.length > 0 && (
                                    <div className="mt-4 mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className='flex items-center'>
                                                <div className="bg-indigo-100 p-1.5 rounded-lg mr-2">
                                                    <CircleCheck className='h-4 w-4 text-indigo-600' />
                                                </div>
                                                <div>
                                                    <p className='text-sm font-semibold text-gray-900'>{selectedRequests.length} item{selectedRequests.length > 1 ? "s" : ""} selected</p>
                                                    <p className='text-xs text-gray-500'>Choose an action to apply to selected requests</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={approveSelected}
                                                    className="inline-flex cursor-pointer items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-lg shadow-sm text-green-700 bg-green-50 hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                                >
                                                    <CircleCheck className='h-4 w-4 mr-1' />
                                                    Approve Selected
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectModal(true)}
                                                    className="inline-flex cursor-pointer items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-lg shadow-sm text-red-600 bg-red-50 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                                >
                                                    <TbCircleX className="h-4 w-4 mr-1" />
                                                    Reject Selected
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className='overflow-x-auto min-h-[400px] bg-white mt-4'>
                                    <table className='min-w-full'>
                                        <thead className='bg-gray-100 border-b border-gray-200'>
                                            <tr>

                                                {canApprove && (
                                                    <th scope="col" className="px-3 sm:px-4 lg:px-6 py-3 text-left">
                                                        <div className="group grid size-4 grid-cols-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    filteredRequests.length > 0 &&
                                                                    selectedRequests.length === filteredRequests.length
                                                                }
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedRequests(
                                                                            filteredRequests.map((r: any) => r._id)
                                                                        );
                                                                    } else {
                                                                        setSelectedRequests([]);
                                                                    }
                                                                }}
                                                                className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600"
                                                            />
                                                            <svg
                                                                className="pointer-events-none col-start-1 row-start-1 size-3 self-center justify-self-center stroke-white"
                                                                viewBox="0 0 14 14"
                                                                fill="none"
                                                            >
                                                                <path
                                                                    className="opacity-0 group-has-checked:opacity-100"
                                                                    d="M3 8L6 11L11 3.5"
                                                                    strokeWidth={2}
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </th>
                                                )}
                                                <th scope='col' className='px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                                    <div className='flex items-center space-x-1'>
                                                        <User className='h-3 w-3 text-indigo-600' />
                                                        <span>Team Member</span>
                                                    </div>
                                                </th>

                                                <th scope='col' className='px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                                    <div className='flex items-center space-x-1'>
                                                        <Clock3 className='h-3 w-3 text-indigo-600' />
                                                        <span>Duration</span>
                                                    </div>
                                                </th>

                                                <th scope='col' className='px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                                    <div className='flex items-center space-x-1'>
                                                        <PiPencilSimpleLineBold className='h-3 w-3 text-indigo-600' />
                                                        <span>Category</span>
                                                    </div>
                                                </th>

                                                <th scope='col' className='px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell'>
                                                    <div className='flex items-center space-x-1'>
                                                        <LuMessageSquareText className='h-3 w-3 text-indigo-600' />
                                                        <span>Description</span>
                                                    </div>
                                                </th>

                                                <th scope='col' className='px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell'>
                                                    <div className='flex items-center space-x-1'>
                                                        <IoDocumentTextOutline className='h-3 w-3 text-indigo-600' />
                                                        <span>Manager Comments</span>
                                                    </div>
                                                </th>

                                                <th scope='col' className='px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                                    <div className='flex items-center space-x-1'>
                                                        <CircleCheck className='h-3 w-3 text-indigo-600' />
                                                        <span>Status</span>
                                                    </div>
                                                </th>

                                                {canApprove && (
                                                    <th
                                                        scope="col"
                                                        className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                                    >
                                                        <div className="flex items-center space-x-1">
                                                            <Waypoints className="h-3 w-3 text-indigo-600" />
                                                            <span>Actions</span>
                                                        </div>
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredRequests.map((request: any) => (
                                                <tr
                                                    key={request._id}
                                                    className="group hover:bg-gray-50 transition-colors duration-200"
                                                >
                                                    {canApprove && (
                                                        <td className='px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap'>
                                                            <div className='group grid size-4 grid-cols-1'>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRequests.includes(request._id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedRequests(prev => [...prev, request._id]);
                                                                        } else {
                                                                            setSelectedRequests(prev =>
                                                                                prev.filter(id => id !== request._id)
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600"
                                                                />
                                                                <svg
                                                                    className="pointer-events-none col-start-1 row-start-1 size-3 self-center justify-self-center stroke-white"
                                                                    viewBox="0 0 14 14"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        className="opacity-0 group-has-checked:opacity-100"
                                                                        d="M3 8L6 11L11 3.5"
                                                                        strokeWidth={2}
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </td>
                                                    )}

                                                    <td className='px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap'>
                                                        <div className='flex items-center'>
                                                            <span className='flex h-full'>
                                                                {request.requestedBy.avatar ? (
                                                                    <img
                                                                        src={getAvatarUrl(request.requestedBy.avatar) || ""}
                                                                        alt=""
                                                                        className="flex-shrink-0 relative w-10 h-10 cursor-pointer rounded-full object-cover shadow-sm ring-1 ring-gray-300 group-hover:ring-indigo-500 transition-all duration-200"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = "none";
                                                                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                                                        }}
                                                                    />
                                                                ) : null}

                                                                <div className="hidden flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center font-semibold text-sm shadow-sm ring-1 ring-gray-300">
                                                                    {getUserInitials(
                                                                        request.requestedBy.firstName,
                                                                        request.requestedBy.lastName
                                                                    )}
                                                                </div>
                                                                <div className='text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200'>
                                                                    <div className='ml-3'>{request.requestedBy.firstName} {request.requestedBy.lastName}</div>
                                                                    <div className='ml-3'>
                                                                        <div className='text-xs text-gray-500'>{request.requestedBy.team?.name || "No Team"}</div>
                                                                    </div>
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className='px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap'>
                                                        <div className='flex items-center'>
                                                            <div className='flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-100 mr-2 shadow-sm'>
                                                                <Clock3 className='h-4 w-4 text-indigo-600' />
                                                            </div>
                                                            <div>
                                                                <div className='text-sm font-semibold text-gray-900'>{new Date(request.startTime).toLocaleString()}</div>
                                                                <div className='text-xs text-gray-500'>to {new Date(request.endTime).toLocaleTimeString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className='px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap'>
                                                        <span className='px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg bg-yellow-100 text-yellow-700'>
                                                            <span className="hidden sm:inline">
                                                                {request.type === "work" ? "Work Time" : "Break Time"}
                                                            </span>

                                                            <span className="sm:hidden">
                                                                {request.type === "work" ? "Work" : "Break"}
                                                            </span>
                                                        </span>
                                                    </td>

                                                    <td className='px-3 sm:px-4 lg:px-6 py-4 hidden lg:table-cell'>
                                                        <div className='text-sm font-medium text-gray-500 max-w-xs'>
                                                            <div className='bg-gray-100 rounded-md p-2 border border-gray-200'>{request.reason}</div>
                                                        </div>
                                                    </td>

                                                    <td className='px-3 sm:px-4 lg:px-6 py-4 hidden lg:table-cell'>
                                                        <div className='text-sm font-medium text-gray-500 max-w-xs'>
                                                            <div className='bg-gray-100 rounded-md p-2 border border-gray-200'>{request.managerComment || "N/A"}</div>
                                                        </div>
                                                    </td>

                                                    <td className='px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap'>
                                                        <div>
                                                            <span className='px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg bg-yellow-100 text-yellow-700'>{request.status}</span>
                                                            <div className='lg:hidden mt-2 space-y-1'>
                                                                <div className='p-1.5 bg-indigo-100 rounded-md border border-gray-200'>
                                                                    <div className='text-xs text-indigo-600'>
                                                                        <span className='font-semibold'>Note:</span>
                                                                        Lost something....
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {canApprove && (
                                                        <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                                                                <button
                                                                    onClick={() => approveRequest(request._id)}
                                                                    className="inline-flex cursor-pointer items-center font-semibold px-4 py-2 text-sm rounded-md shadow-sm border border-indigo-600 text-indigo-600 hover:bg-indigo-100 transition"
                                                                >
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setShowRejectModal(true);
                                                                    }}
                                                                    className="inline-flex items-center cursor-pointer px-3 py-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-500 rounded-lg transition text-xs shadow-sm"
                                                                >
                                                                    <TbCircleX className="h-3 w-3 mr-1" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RejectRequestModal
                open={showRejectModal}
                request={selectedRequest}
                requests={selectedRequests}
                onClose={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setSelectedRequests([]);
                }}
                onSuccess={() => {
                    fetchRequests();
                    setSelectedRequests([]);
                }}
            />
        </>
    );
}

export default Inbox;
