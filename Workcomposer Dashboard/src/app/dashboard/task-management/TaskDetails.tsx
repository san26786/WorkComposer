"use client";

import API from "@/api";
import { TbSelector } from "react-icons/tb";
import { Check, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import DeleteTaskModal from "./DeleteTaskModal";
import { useContext } from "react";
import DashboardContext, { useDashboard } from "@/context/DashboardContext";

const TaskDetails = ({
    setShowTaskModal,
    selectedTask,
    fetchTasks,
    readOnly = false,
}: {
    setShowTaskModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedTask: any;
    fetchTasks: () => Promise<void>;
    readOnly?: boolean;
}) => {

    const [users, setUsers] = useState<any[]>([]);
    const [showPriority, setShowPriority] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [showAssignee, setShowAssignee] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");

    const [priority, setPriority] = useState(selectedTask?.priority
        ? selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)
        : "Low"
    );

    const [status, setStatus] = useState(selectedTask?.status === "todo"
        ? "ToDo"
        : selectedTask?.status === "in-progress"
            ? "In Progress"
            : selectedTask?.status === "completed"
                ? "Done"
                : "ToDo"
    );

    const [title, setTitle] = useState(selectedTask?.title || "");

    const [description, setDescription] = useState(selectedTask?.description || "");

    const [dueDate, setDueDate] = useState(selectedTask?.dueDate
        ? selectedTask.dueDate.split("T")[0]
        : ""
    );

    const [assigneeIds, setAssigneeIds] = useState<string[]>(() => {
        if (Array.isArray(selectedTask?.assignedTo)) {
            return selectedTask.assignedTo.map((u: any) => u._id);
        }
        return selectedTask?.assignedTo?._id ? [selectedTask.assignedTo._id] : [];
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [openCommentMenu, setOpenCommentMenu] = useState<string | null>(null);

    const { user } = useDashboard();

    const canManageTasks =
        user?.permissions?.includes("manage_tasks");

    const isReadOnly = readOnly || !canManageTasks;


    const fetchUsers = async () => {
        try {
            const { data } = await API.get("/users");

            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const load = async () => {
            await Promise.all([
                fetchUsers(),
                fetchCurrentUser(),
            ]);
        };

        load();
    }, []);


    useEffect(() => {
        const handleClickOutside = () => {
            setShowPriority(false);
            setShowStatus(false);
            setShowAssignee(false);
        };

        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (selectedTask?.id) {
            fetchComments();
        }
    }, [selectedTask]);


    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            await API.put(`/tasks/${selectedTask.id}`, {
                title,
                description,
                dueDate,
                priority: priority.toLowerCase(),
                status:
                    status === "ToDo" ? "todo" : status === "In Progress" ? "in-progress" : "completed",
                assignedTo: assigneeIds, // was: assigneeId || null
            });

            await fetchTasks();

            setShowTaskModal(false);

        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTask = async () => {
        try {

            setDeleting(true);

            await API.delete(`/tasks/${selectedTask.id}`);

            await fetchTasks();

            setShowDeleteModal(false);

            setShowTaskModal(false);

        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    const fetchComments = async () => {
        if (!selectedTask?.id) return;

        try {
            setLoadingComments(true);

            const { data } = await API.get(
                `/tasks/${selectedTask.id}/comments`
            );

            setComments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const { data } = await API.post(
                `/tasks/${selectedTask.id}/comments`,
                {
                    content: newComment,
                }
            );

            setComments((prev: any) => [...prev, data]);

            setNewComment("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editingContent.trim()) return;

        try {
            const { data } = await API.put(
                `/tasks/comment/${commentId}`,
                {
                    content: editingContent,
                }
            );

            setComments((prev: any) =>
                prev.map((comment: any) =>
                    comment._id === commentId ? data : comment
                )
            );

            setEditingCommentId(null);
            setEditingContent("");
            setOpenCommentMenu(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await API.delete(`/tasks/comment/${commentId}`);

            setComments((prev: any) =>
                prev.filter((comment: any) => comment._id !== commentId)
            );

            setOpenCommentMenu(null);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const { data } = await API.get("/auth/me");

            setCurrentUser(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div role='dialog' className='relative z-[100]'>
                <div className='fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity'></div>
                <div
                    onClick={() => setShowTaskModal(false)}
                    className='fixed inset-0 z-[100] w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            className='relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl'>

                            <header className='text-lg font-semibold text-gray-900'>Task Details</header>
                            {isReadOnly && (
                                <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        <svg
                                            className="mt-0.5 h-5 w-5 text-blue-600 shrink-0"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm-1 4a1 1 0 000 2h1v2a1 1 0 102 0v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>

                                        <div>
                                            <p className="text-sm font-medium text-blue-900">
                                                {readOnly ? "Viewing task from Slack" : "Read-only task"}
                                            </p>

                                            <p className="mt-1 text-sm text-blue-700">
                                                {readOnly
                                                    ? "This task is opened in read-only mode. Open it from the Task Management page if you need to edit it."
                                                    : "You can view this task and participate in comments, but you don't have permission to modify task details."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className='mt-4'>
                                <div>
                                    <form
                                        onSubmit={handleSubmit}
                                        className='space-y-6'>

                                        <div>
                                            <label htmlFor='title' className='block text-sm/6 font-medium text-gray-900'>Title</label>
                                            <div className='mt-2'>
                                                <input
                                                    id='title'
                                                    type='text'
                                                    value={title}
                                                    onChange={(e) =>
                                                        setTitle(e.target.value)
                                                    }
                                                    readOnly={isReadOnly}
                                                    placeholder='Enter task title' className='block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'></input>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor='description' className='block text-sm/6 font-medium text-gray-900'>Description</label>
                                            <div className='mt-2'>
                                                <textarea
                                                    id='description'
                                                    value={description}
                                                    onChange={(e) =>
                                                        setDescription(e.target.value)
                                                    }
                                                    readOnly={isReadOnly}
                                                    rows={4}
                                                    placeholder='Enter task description'
                                                    className='block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'></textarea>
                                            </div>
                                        </div>

                                        <div>
                                            <label className='block text-sm/6 font-medium text-gray-900'>
                                                Due Date
                                            </label>

                                            <div className='mt-2'>
                                                <input
                                                    type='date'
                                                    value={dueDate}
                                                    onChange={(e) =>
                                                        setDueDate(e.target.value)
                                                    }
                                                    readOnly={isReadOnly}
                                                    className='block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6'
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor='project' className='block text-sm/6 font-medium text-gray-900'>Project</label>
                                            <div className='mt-2'>
                                                <input
                                                    id='project'
                                                    value={selectedTask?.project?.name || "Default Project"}
                                                    readOnly className='block w-full cursor-not-allowed rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-700 sm:text-sm'></input>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                            <div>
                                                <label className='block text-sm/6 font-medium text-gray-900'>Priority</label>
                                                <div className='relative mt-2'>
                                                    <button
                                                        type='button'
                                                        aria-haspopup='listbox'
                                                        disabled={isReadOnly}
                                                        onClick={(e) => {
                                                            if (isReadOnly) return;

                                                            e.stopPropagation();

                                                            setShowPriority(!showPriority);
                                                            setShowStatus(false);
                                                            setShowAssignee(false);
                                                        }}
                                                        className={`grid w-full ${isReadOnly ? "cursor-not-allowed bg-gray-50" : "cursor-pointer bg-white"
                                                            } rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                                                    >
                                                        <span className='col-start-1 row-start-1 truncate pr-6'>{priority}</span>
                                                        <TbSelector className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
                                                    </button>

                                                    {showPriority && (
                                                        <ul
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            aria-orientation="vertical" role="listbox" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            <li
                                                                onClick={() => {
                                                                    setPriority("Low");
                                                                    setShowPriority(false);
                                                                }}
                                                                className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50 focus:bg-gray-50" role="option">
                                                                <div className="text-gray-900 absolute inset-0 rounded-md"></div>
                                                                <span className="font-semibold relative block truncate text-gray-900">Low</span>
                                                                {priority === "Low" && (
                                                                    <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                        <Check className="size-5" />
                                                                    </span>
                                                                )}
                                                            </li>

                                                            <li
                                                                onClick={() => {
                                                                    setPriority("Medium");
                                                                    setShowPriority(false);
                                                                }}
                                                                className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50 focus:bg-gray-50">
                                                                <div className="text-gray-900 absolute inset-0 rounded-md"></div>
                                                                <span className="font-normal relative block truncate text-gray-900">Medium</span>
                                                                {priority === "Medium" && (
                                                                    <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                        <Check className="size-5" />
                                                                    </span>
                                                                )}
                                                            </li>

                                                            <li
                                                                onClick={() => {
                                                                    setPriority("High");
                                                                    setShowPriority(false);
                                                                }}
                                                                className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50 focus:bg-gray-50">
                                                                <div className="text-gray-900 absolute inset-0 rounded-md"></div>
                                                                <span className="font-normal relative block truncate text-gray-900">High</span>
                                                                {priority === "High" && (
                                                                    <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                        <Check className="size-5" />
                                                                    </span>
                                                                )}
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm/6 font-medium text-gray-900">Status</label>
                                                <div className="relative mt-2">
                                                    <button
                                                        type="button"
                                                        aria-haspopup="listbox"
                                                        disabled={isReadOnly}
                                                        onClick={(e) => {
                                                            if (isReadOnly) return;

                                                            e.stopPropagation();

                                                            setShowStatus(!showStatus);
                                                            setShowPriority(false);
                                                            setShowAssignee(false);
                                                        }}
                                                        className={`grid w-full ${isReadOnly
                                                            ? "cursor-not-allowed bg-gray-50"
                                                            : "cursor-pointer bg-white"
                                                            } rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                                                    >
                                                        <span className="col-start-1 row-start-1 truncate pr-6">{status}</span>
                                                        <TbSelector className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
                                                    </button>

                                                    {showStatus && (
                                                        <ul
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            aria-orientation="vertical" role="listbox" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            <li
                                                                onClick={() => {
                                                                    setStatus("ToDo");
                                                                    setShowStatus(false);
                                                                }}
                                                                className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50 focus:bg-gray-50">
                                                                <div className="text-gray-900 absolute inset-0 rounded-md"></div>
                                                                <span className="font-semibold relative block truncate text-gray-900">ToDo</span>
                                                                {status === "ToDo" && (
                                                                    <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                        <Check className="size-5" />
                                                                    </span>
                                                                )}
                                                            </li>

                                                            <li
                                                                onClick={() => {
                                                                    setStatus("In Progress");
                                                                    setShowStatus(false);
                                                                }}
                                                                className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50 focus:bg-gray-50">
                                                                <div className="text-gray-900 absolute inset-0 rounded-md"></div>
                                                                <span className="font-normal relative block truncate text-gray-900">In Progress</span>
                                                                {status === "In Progress" && (
                                                                    <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                        <Check className="size-5" />
                                                                    </span>
                                                                )}
                                                            </li>

                                                            <li
                                                                onClick={() => {
                                                                    setStatus("Done");
                                                                    setShowStatus(false);
                                                                }}
                                                                className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50 focus:bg-gray-50">
                                                                <div className="text-gray-900 absolute inset-0 rounded-md"></div>
                                                                <span className="font-normal relative block truncate text-gray-900">Done</span>
                                                                {status === "Done" && (
                                                                    <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                        <Check className="size-5" />
                                                                    </span>
                                                                )}
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm/6 font-medium text-gray-900">Assignees</label>
                                            <div className="relative mt-2">
                                                <div
                                                    role="button"
                                                    tabIndex={isReadOnly ? -1 : 0}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={showAssignee}
                                                    onClick={(e) => {
                                                        if (isReadOnly) return;
                                                        e.stopPropagation();
                                                        setShowAssignee(!showAssignee);
                                                        setShowPriority(false);
                                                        setShowStatus(false);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (isReadOnly) return;
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setShowAssignee(!showAssignee);
                                                            setShowPriority(false);
                                                            setShowStatus(false);
                                                        }
                                                    }}
                                                    className={`grid w-full ${isReadOnly ? "cursor-not-allowed bg-gray-50" : "cursor-pointer bg-white"
                                                        } min-h-[38px] rounded-md py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                                                >
                                                    {assigneeIds.length === 0 ? (
                                                        <span className="col-start-1 row-start-1 truncate pr-6 text-gray-400">
                                                            Select assignees
                                                        </span>
                                                    ) : (
                                                        <div className="col-start-1 row-start-1 flex flex-wrap gap-1 pr-6">
                                                            {assigneeIds.map((id) => {
                                                                const u = users.find((usr) => usr._id === id);
                                                                if (!u) return null;
                                                                return (
                                                                    <span
                                                                        key={id}
                                                                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                                                                    >
                                                                        {u.firstName} {u.lastName}
                                                                        {!isReadOnly && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setAssigneeIds((prev) =>
                                                                                        prev.filter((existingId) => existingId !== id)
                                                                                    );
                                                                                }}
                                                                                className="ml-0.5 text-indigo-400 hover:text-indigo-700"
                                                                                aria-label={`Remove ${u.firstName}`}
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        )}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    <TbSelector className="col-start-1 row-start-1 size-5 self-start justify-self-end text-gray-500 sm:size-4 mt-0.5" />
                                                </div>

                                                {showAssignee && (
                                                    <ul
                                                        onClick={(e) => e.stopPropagation()}
                                                        role="listbox"
                                                        aria-multiselectable="true"
                                                        className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                                                    >
                                                        <li
                                                            onClick={() => setAssigneeIds([])}
                                                            className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50"
                                                        >
                                                            <div className="relative flex items-center">
                                                                <span className="font-semibold ml-3 truncate text-gray-900">
                                                                    - Clear all -
                                                                </span>
                                                            </div>
                                                            {assigneeIds.length === 0 && (
                                                                <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                    <Check className="size-5" />
                                                                </span>
                                                            )}
                                                        </li>

                                                        {users.map((user) => {
                                                            const isSelected = assigneeIds.includes(user._id);

                                                            return (
                                                                <li
                                                                    key={user._id}
                                                                    onClick={() => {
                                                                        setAssigneeIds((prev) =>
                                                                            isSelected
                                                                                ? prev.filter((id) => id !== user._id)
                                                                                : [...prev, user._id]
                                                                        );
                                                                    }}
                                                                    aria-selected={isSelected}
                                                                    className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-50"
                                                                >
                                                                    <div className="relative flex items-center">
                                                                        {user.avatar?.trim() ? (
                                                                            <Image
                                                                                src={user.avatar}
                                                                                alt={`${user.firstName} ${user.lastName}`}
                                                                                width={24}
                                                                                height={24}
                                                                                unoptimized
                                                                                className="size-6 shrink-0 rounded-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="size-6 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                                                                                {user.firstName?.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <span
                                                                            className={`ml-3 truncate text-gray-900 ${isSelected ? "font-semibold" : "font-normal"
                                                                                }`}
                                                                        >
                                                                            {user.firstName} {user.lastName}
                                                                        </span>
                                                                    </div>

                                                                    {isSelected && (
                                                                        <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                            <Check className="size-5" />
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {!isReadOnly && (
                                            <div className="text-center">
                                                <button
                                                    type="submit"
                                                    className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        )}

                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Comments
                                            </h3>

                                            <div className="mt-4">
                                                <textarea
                                                    rows={3}
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                                />

                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddComment}
                                                        disabled={!newComment.trim()}
                                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Post Comment
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-1">
                                                {loadingComments ? (
                                                    <p className="text-sm text-gray-500">
                                                        Loading comments...
                                                    </p>
                                                ) : comments.length === 0 ? (
                                                    <p className="text-sm text-gray-500">
                                                        No comments yet.
                                                    </p>
                                                ) : (
                                                    comments.map((comment: any) => {
                                                        return (
                                                            <div
                                                                key={comment._id}
                                                                className="rounded-lg border border-gray-200 p-4"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        {comment.user?.avatar ? (
                                                                            <Image
                                                                                src={comment.user.avatar}
                                                                                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                                                                                width={32}
                                                                                height={32}
                                                                                unoptimized
                                                                                className="rounded-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                                                                                {comment.user?.firstName?.charAt(0)}
                                                                            </div>
                                                                        )}

                                                                        <div>
                                                                            <p className="font-medium text-gray-900">
                                                                                {comment.user?.firstName}{" "}
                                                                                {comment.user?.lastName}
                                                                            </p>

                                                                            <p className="text-xs text-gray-500">
                                                                                {new Date(
                                                                                    comment.createdAt
                                                                                ).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {comment.user?._id === currentUser?._id && (
                                                                        <div className="relative">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setOpenCommentMenu(
                                                                                        openCommentMenu === comment._id
                                                                                            ? null
                                                                                            : comment._id
                                                                                    )
                                                                                }
                                                                                className="rounded p-1 hover:bg-gray-100"
                                                                            >
                                                                                <MoreVertical className="h-5 w-5 text-gray-500" />
                                                                            </button>

                                                                            {openCommentMenu === comment._id && (
                                                                                <div className="absolute right-0 z-10 mt-2 w-36 rounded-md border bg-white shadow-lg">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setEditingCommentId(comment._id);
                                                                                            setEditingContent(comment.content);
                                                                                            setOpenCommentMenu(null);
                                                                                        }}
                                                                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                                                    >
                                                                                        Edit
                                                                                    </button>

                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteComment(comment._id)}
                                                                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {editingCommentId === comment._id ? (
                                                                    <div className="mt-3">
                                                                        <textarea
                                                                            rows={3}
                                                                            value={editingContent}
                                                                            onChange={(e) => setEditingContent(e.target.value)}
                                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                                        />

                                                                        <div className="mt-2 flex justify-end gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setEditingCommentId(null);
                                                                                    setEditingContent("");
                                                                                }}
                                                                                className="rounded-md border px-3 py-1 text-sm"
                                                                            >
                                                                                Cancel
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateComment(comment._id)}
                                                                                className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white"
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                                                                        {comment.content}
                                                                    </p>
                                                                )}

                                                                {comment.edited && (
                                                                    <p className="mt-2 text-xs italic text-gray-400">
                                                                        Edited
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        <hr className="my-4"></hr>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Created: {
                                                selectedTask?.createdAt
                                                    ? new Date(selectedTask.createdAt).toLocaleString()
                                                    : "-"
                                            }</span>
                                            <span>Updated: {
                                                selectedTask?.updatedAt
                                                    ? new Date(selectedTask.updatedAt).toLocaleString()
                                                    : "-"
                                            }</span>
                                            {!isReadOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="underline text-red-600 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <DeleteTaskModal

                    setShowDeleteModal={setShowDeleteModal}

                    handleDeleteTask={handleDeleteTask}
                    deleting={deleting}
                />
            )}
        </>
    )
}

export default TaskDetails
