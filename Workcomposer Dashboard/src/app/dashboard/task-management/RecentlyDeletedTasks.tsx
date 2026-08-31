"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import {
    X,
    RotateCcw,
    Trash2,
    AlertTriangle,
} from "lucide-react";

import toast from "react-hot-toast";

type Props = {
    onClose: () => void;
};

export default function RecentlyDeletedTasks({ onClose }: Props) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [taskToDelete, setTaskToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchDeletedTasks = async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/tasks/recently-deleted");

         
            setTasks(data);
        } catch (err) {
            toast.error("FAILED TO FETCH DELETED TASKS");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedTasks();
    }, []);

    const restoreTask = async (taskId: string) => {
        try {
            await API.patch(
                `/tasks/recently-deleted/${taskId}/restore`
            );

            await fetchDeletedTasks();

            toast.success("Task restored successfully.");

            window.dispatchEvent(new Event("tasksUpdated"));
        } catch (err: any) {
            console.error("RESTORE TASK ERROR:", err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to restore task."
            );
        }
    };

    const permanentlyDeleteTask = async () => {
        if (!taskToDelete) return;

        try {
            setDeleting(true);

            await API.delete(
                `/tasks/recently-deleted/${taskToDelete._id}`
            );

            await fetchDeletedTasks();

            toast.success("Task permanently deleted.");

            setTaskToDelete(null);
        } catch (err: any) {
            console.error("PERMANENT DELETE TASK ERROR:", err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to permanently delete task."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recently Deleted
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {tasks.length} deleted task
                            {tasks.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                            Loading deleted tasks...
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <Trash2 className="mb-3 h-10 w-10 text-gray-300" />

                            <p className="text-sm font-medium">
                                No recently deleted tasks
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Deleted tasks will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                                >
                                    {/* TASK INFO */}
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {task.title}
                                        </p>

                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span>
                                                {task.project?.name || "No project"}
                                            </span>

                                            <span>•</span>

                                            <span>
                                                Deleted{" "}
                                                {task.deletedAt
                                                    ? new Date(
                                                        task.deletedAt
                                                    ).toLocaleDateString()
                                                    : "-"}
                                            </span>

                                            {task.deletedBy && (
                                                <>
                                                    <span>•</span>

                                                    <span>
                                                        by {task.deletedBy.firstName}{" "}
                                                        {task.deletedBy.lastName}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* RESTORE */}
                                    <div className="ml-4 flex shrink-0 items-center gap-2">
                                        <button
                                            onClick={() => restoreTask(task._id)}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Restore
                                        </button>

                                        <button
                                            onClick={() => setTaskToDelete(task)}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-red-500 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete permanently
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {taskToDelete && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
                    onClick={() => {
                        if (!deleting) {
                            setTaskToDelete(null);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="flex items-start gap-4 px-6 pt-6">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Permanently delete task?
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* TASK */}
                        <div className="mx-6 mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">
                                {taskToDelete.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                {taskToDelete.project?.name || "No project"}
                            </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 px-6 py-5">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setTaskToDelete(null)}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={permanentlyDeleteTask}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    "Deleting..."
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}