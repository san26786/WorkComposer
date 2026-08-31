"use client"

import { X } from 'lucide-react';
import { useEffect, useState } from "react";
import API from "@/api";

type Props = {
    open: boolean;
    task: any;
    startDate: string;
    endDate: string;
    onClose: () => void;
};

const TaskDetailsModal = ({
    open,
    task,
    startDate,
    endDate,
    onClose,
}: Props) => {

    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!open || !task?._id) return;

        const fetchTaskDetails = async () => {
            try {
                const { data } = await API.get(`/project-tracking/task/${task._id}`, {
                    params: {
                        startDate,
                        endDate,
                    },
                });

                setUsers(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchTaskDetails();
    }, [open, task]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours === 0 && minutes === 0) {
            return "< 1m";
        }

        return `${hours}h ${minutes}m`;
    };


    if (!open) return null;
    return (
        <>
            <div className='relative z-50'>
                <div className='fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity'></div>
                <div className='fixed inset-0 z-50 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-200 transition-all">
                            <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
                                <div className='flex items-center justify-between'>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Task Details
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className='p-4'>
                                <div>
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                                    User
                                                </th>

                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                                    Duration
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">

                                            {users.length > 0 ? (
                                                users.map((item: any) => (
                                                    <tr
                                                        key={item.user._id}
                                                        className="hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">

                                                                <img
                                                                    src={item.user.avatar || "/avatar.png"}
                                                                    alt={item.user.firstName}
                                                                    className="w-8 h-8 rounded-full object-cover border"
                                                                />

                                                                <span className="font-medium text-gray-900">
                                                                    {item.user.firstName} {item.user.lastName}
                                                                </span>

                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="font-medium text-gray-900">
                                                                {formatTime(item.duration)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={2}
                                                        className="py-10 text-center text-gray-500"
                                                    >
                                                        No users have tracked this task yet.
                                                    </td>
                                                </tr>
                                            )}

                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className='px-4 py-3 bg-wc-surface-2 border-t border-wc-border rounded-b-lg'>
                                <div className='flex justify-end'>
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md shadow-sm text-sm font-medium transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TaskDetailsModal
