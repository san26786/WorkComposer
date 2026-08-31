"use client"

import API from "@/api";
import { Search, ChevronDown, Plus } from 'lucide-react';
import { TbSelector } from "react-icons/tb";
import { MessageCircle } from "lucide-react";
import { IoCheckmark } from "react-icons/io5";
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import NewTask from './NewTask';
import TaskDetails from './TaskDetails';
import RecentlyDeletedTasks from "./RecentlyDeletedTasks";
import { useDesktop } from "@/context/DesktopContext";
import { useProject } from "@/context/ProjectContext";
import { useContext } from "react";
import { useTimer } from "@/context/TimerContext";
import DashboardContext, { useDashboard } from "@/context/DashboardContext";
import SettingsLoading from "@/components/settings/SettingsLoading";


type TaskManagementProps = {
    selectedProject?: string;
    isDesktop?: boolean;
};

export default function TaskManagement({
    selectedProject,
    isDesktop = false,
}: TaskManagementProps) {

    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All statuses");
    const [selectedType, setSelectedType] = useState("All");

    const [statusOpen, setStatusOpen] = useState(false);
    const [assigneeOpen, setAssigneeOpen] = useState(false);
    const [typeOpen, setTypeOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);

    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);

    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showRecentlyDeleted, setShowRecentlyDeleted] = useState(false);
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const { user } = useDashboard();

    const canManageTasks =
        user?.permissions?.includes("manage_tasks");

    const {
        setSelectedProject,
        setSelectedTask: setTrackingTask,
    } = useProject();

    const {
        timer,
        start,
        switchTask,
        isTracking,
    } = useTimer();

    const router = useRouter();
    const searchParams = useSearchParams();
    const taskId = searchParams.get("task");

    const currentProject =
        selectedProject ??
        searchParams.get("project") ??
        "Default Project";

    const fetchCommentCounts = async (tasksList: any[]) => {
        try {
            const results = await Promise.all(
                tasksList.map(async (task) => {
                    try {
                        const { data } = await API.get(
                            `/tasks/${task.id}/comments/unread-count`
                        );

                        return [task.id, data.count] as const;
                    } catch (error) {
                        console.error(
                            `Failed to fetch comment count for task ${task.id}`,
                            error
                        );

                        return [task.id, 0] as const;
                    }
                })
            );

            setCommentCounts(Object.fromEntries(results));
        } catch (error) {
            console.error("FAILED TO FETCH COMMENT COUNTS:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await API.get("/tasks");

            const formattedTasks = res.data.map((task: any) => ({
                id: task._id,

                title: task.title,
                description: task.description,

                dueDate: task.dueDate,

                createdAt: task.createdAt,
                updatedAt: task.updatedAt,

                project: {
                    _id: task.project?._id,
                    name: task.project?.name || "Default Project",
                },

                assignedTo: task.assignedTo,

                priority:
                    task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1),

                status:
                    task.status === "todo"
                        ? "Todo"
                        : task.status === "in-progress"
                            ? "In progress"
                            : "Done",

                assignees: task.assignedTo
                    ? [task.assignedTo.email]
                    : [],

                type:
                    task.provider === "jira"
                        ? "Jira Tasks"
                        : task.provider === "asana"
                            ? "Asana Tasks"
                            : "Internal Tasks",
            }))
            setTasks(formattedTasks);
            fetchCommentCounts(formattedTasks);

            if (taskId) {
                const task = formattedTasks.find((t: any) => t.id === taskId);

                if (task) {
                    setSelectedTask(task);
                    setShowTaskModal(true);

                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("task");

                    router.replace(`?${params.toString()}`, {
                        scroll: false,
                    });
                }
            }

        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        const loadTasks = async () => {
            await fetchTasks();
            setLoading(false);
        };

        loadTasks();
    }, []);

    useEffect(() => {
        const handleTasksUpdated = () => {
            fetchTasks();
        };

        window.addEventListener("tasksUpdated", handleTasksUpdated);

        return () => {
            window.removeEventListener("tasksUpdated", handleTasksUpdated);
        };
    }, []);


    const statuses = ["Todo", "In progress", "Done"];

    const assignees = [
        "Not assigned",

        ...Array.from(
            new Set(
                tasks.filter((task) =>
                    task.assignees.length > 0).flatMap((task) =>
                        task.assignees)
            )
        )
    ];

    const taskTypes = [
        "All",
        "Internal Tasks",
        "Jira Tasks",
        "Asana Tasks"
    ];

    // FILTER LOGIC
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch = task.title?.toLowerCase().includes(search.toLowerCase()
            );

            const matchesStatus = selectedStatus === "All statuses"
                ? true
                : task.status === selectedStatus;

            const matchesAssignee = selectedAssignees.length === 0
                ? true
                : task.assignees.some((assignee: string) =>
                    selectedAssignees.includes(assignee)
                );

            const matchesType = selectedType === "All"
                ? true
                : task.type === selectedType;

            const matchesProject =

                task.project?.name === currentProject


            return (
                matchesSearch &&
                matchesStatus &&
                matchesAssignee &&
                matchesType &&
                matchesProject
            );
        });
    }, [
        tasks, search, selectedStatus, selectedAssignees, selectedType, currentProject
    ]);

    const toggleAssignee = (assignee: string) => {
        setSelectedAssignees((prev) =>
            prev.includes(assignee)
                ? prev.filter((item) => item !== assignee)
                : [...prev, assignee]
        );
    };


    const totalTasks = filteredTasks.length;

    const todoTasks = filteredTasks.filter(
        (task) => task.status === "Todo"
    ).length;

    const inProgressTasks = filteredTasks.filter(
        (task) => task.status === "In progress"
    ).length;

    const doneTasks = filteredTasks.filter(
        (task) => task.status === "Done"
    ).length;

    const overdueTasks = filteredTasks.filter((task) => {
        if (!task.dueDate || task.status === "Done") {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);

        return due < today;
    }).length;

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                <SettingsLoading
                    label="Fetching tasks..."
                    subLabel="Please wait while we load your tasks."
                />
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-3 bg-gray-50 px-4 py-3 border border-gray-200 sm:px-6 lg:px-8 rounded-md">
                    <div className="w-full sm:w-64">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search tasks"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6">
                            </input>
                            <Search className='absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none' />
                        </div>
                    </div>

                    <div className='w-full sm:w-48'>
                        <div className='relative'>
                            <button
                                onClick={() =>
                                    setStatusOpen(!statusOpen)
                                }
                                type='button'
                                className='grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6'>
                                <span className='col-start-1 row-start-1 truncate pr-6'>{selectedStatus}</span>
                                <TbSelector className='col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4' />
                            </button>

                            {statusOpen && (
                                <ul className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm'>
                                    {statuses.map((status) =>
                                    (
                                        <li
                                            key={status}
                                            onClick={() => {
                                                setSelectedStatus(status);
                                                setStatusOpen(false);
                                            }}
                                            className='flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer'
                                        >
                                            <span
                                                className={`block truncate ${selectedStatus === status
                                                    ? "font-semibold text-gray-900"
                                                    : "font-normal text-gray-500"
                                                    }`}
                                            >
                                                {status}
                                            </span>

                                            {selectedStatus === status && (
                                                <IoCheckmark className='w-4 h-4 text-indigo-600' />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>


                    {/* ASSIGNEE */}

                    <div className='w-full sm:w-48'>
                        <div className='relative'>
                            <button
                                onClick={() =>
                                    setAssigneeOpen(!assigneeOpen)
                                }
                                type='button'
                                className='grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6'>
                                <span className='col-start-1 row-start-1 truncate pr-6'>
                                    {selectedAssignees.length === 0
                                        ? "All assignees"
                                        : selectedAssignees.length === 1
                                            ? selectedAssignees[0]
                                            : `${selectedAssignees.length} assignees`}</span>
                                <TbSelector className='col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4' />
                            </button>

                            {assigneeOpen && (
                                <ul className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm'>

                                    {assignees.map((assignee) => (
                                        <li
                                            key={assignee}
                                            onClick={() => toggleAssignee(assignee)}
                                            className='flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer'
                                        >
                                            <span className={
                                                selectedAssignees.includes(assignee)
                                                    ? "font-semibold text-gray-900"
                                                    : "text-gray-500"
                                            }>{assignee}</span>

                                            {selectedAssignees.includes(assignee) && (
                                                <IoCheckmark className='w-4 h-4 text-indigo-600' />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* TASK TYPE */}

                    <div className='w-full sm:w-48'>
                        <div className='relative'>
                            <button
                                onClick={() =>
                                    setTypeOpen(!typeOpen)
                                }
                                type='button'
                                className='grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6'>
                                <span className='col-start-1 row-start-1 truncate pr-6'>{selectedType}</span>
                                <TbSelector className='col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4' />
                            </button>

                            {typeOpen && (
                                <ul className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm'>

                                    {taskTypes.map((type) => (
                                        <li
                                            key={type}
                                            onClick={() => {
                                                setSelectedType(type)
                                                setTypeOpen(false);
                                            }}
                                            className='text-gray-900 relative cursor-pointer select-none py-2 pr-9 pl-3'>
                                            <span
                                                className={`font-semibold block truncate ${selectedType === type
                                                    ? "font-semibold"
                                                    : "font-normal"
                                                    }`}
                                            >{type}</span>

                                            {selectedType === type && (
                                                <span className='text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4'>
                                                    <IoCheckmark className='size-5' />
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>


                    {/* MORE */}

                    <div className='ml-auto'>
                        <div className='relative'>
                            <button
                                onClick={() =>
                                    setMoreOpen(!moreOpen)
                                }
                                type='button'
                                className='inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100'>
                                More
                                <ChevronDown className='h-4 w-4' />
                            </button>

                            {moreOpen && (
                                <div role='menu' className='absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-20'>
                                    <button
                                        onClick={() => {
                                            setMoreOpen(false);
                                            setShowRecentlyDeleted(true);
                                        }}
                                        className='w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100'
                                        role='menuitem'
                                    >
                                        Recently Deleted
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* TASK AREA */}

                <div className='sm:px-6 lg:px-8 my-2 pt-5 min-h-[calc(100vh-230px)] max-h-[calc(100vh-180px)] overflow-y-auto rounded-lg bg-white shadow px-6 py-8'>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>

                        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                            <p className='text-sm text-gray-500'>
                                Total Tasks
                            </p>

                            <h3 className='mt-2 text-2xl font-bold text-gray-900'>
                                {totalTasks}
                            </h3>
                        </div>

                        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                            <p className='text-sm text-gray-500'>
                                Todo
                            </p>

                            <h3 className='mt-2 text-2xl font-bold text-gray-700'>
                                {todoTasks}
                            </h3>
                        </div>

                        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                            <p className='text-sm text-gray-500'>
                                In Progress
                            </p>

                            <h3 className='mt-2 text-2xl font-bold text-blue-600'>
                                {inProgressTasks}
                            </h3>
                        </div>

                        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                            <p className='text-sm text-gray-500'>
                                Done
                            </p>

                            <h3 className='mt-2 text-2xl font-bold text-green-600'>
                                {doneTasks}
                            </h3>
                        </div>

                        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                            <p className='text-sm text-gray-500'>
                                Overdue
                            </p>

                            <h3 className='mt-2 text-2xl font-bold text-red-600'>
                                {overdueTasks}
                            </h3>
                        </div>

                    </div>

                    <div className='flex items-center justify-between mt-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Project: {currentProject}</h3>
                        {canManageTasks && (
                            <button
                                onClick={() => setShowNewTaskModal(true)}
                                className="inline-flex items-center gap-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                New Task
                            </button>
                        )}
                    </div>

                    {/* TASK LIST */}
                    <div className='sm:px-6 lg:px-8'>

                        {/* Select all / bulk delete — shared bar above both layouts */}
                        <div className='mt-8 flex flex-wrap items-center gap-2 px-3 sm:px-0'>
                            <div className='group grid size-4 grid-cols-1'>
                                <input
                                    id='select-all'
                                    type='checkbox'
                                    checked={
                                        filteredTasks.length > 0 &&
                                        filteredTasks.every((task) => selectedTasks.includes(task.id))
                                    }
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedTasks(filteredTasks.map((task) => task.id));
                                        } else {
                                            setSelectedTasks([]);
                                        }
                                    }}
                                    className='col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 void-colors:appearance-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                />
                                <svg className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25' viewBox='0 0 14 14' fill='none'>
                                    <path className='opacity-0 group-has-checked:opacity-100' d='M3 8L6 11L11 3.5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'></path>
                                    <path className='opacity-0 group-has-indeterminate:opacity-100' d='M3 7H11' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'></path>
                                </svg>
                            </div>

                            <label htmlFor='select-all' className='text-sm font-medium text-gray-900'>Select all</label>

                            {canManageTasks && selectedTasks.length > 0 && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await API.delete("/tasks/delete-multiple", {
                                                data: { taskIds: selectedTasks },
                                            });
                                            await fetchTasks();
                                            setSelectedTasks([]);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className='cursor-pointer rounded-sm bg-red-50 px-2 py-1 text-sm font-semibold text-red-600 shadow-xs hover:bg-red-100'
                                >
                                    Delete Selected
                                </button>
                            )}
                        </div>

                        {/* MOBILE: card list (< sm) */}
                        <div className='sm:hidden mt-4 space-y-3'>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const isOverdue =
                                        task.dueDate &&
                                        new Date(task.dueDate) < new Date() &&
                                        task.status !== "Done";

                                    return (
                                        <div
                                            key={task.id}
                                            onClick={async () => {
                                                try {
                                                    await API.patch(`/tasks/${task.id}/comments/read`);
                                                    setCommentCounts((prev) => ({ ...prev, [task.id]: 0 }));
                                                } catch (error) {
                                                    console.error("FAILED TO MARK COMMENTS AS READ:", error);
                                                }
                                                setSelectedTask(task);
                                                setShowTaskModal(true);
                                            }}
                                            className={`rounded-lg border p-4 cursor-pointer ${isOverdue ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
                                                }`}
                                        >
                                            <div className='flex items-start justify-between gap-2'>
                                                <div className='flex items-start gap-2 min-w-0'>
                                                    <div className='group grid size-4 grid-cols-1 mt-0.5 shrink-0'>
                                                        <input
                                                            type='checkbox'
                                                            onClick={(e) => e.stopPropagation()}
                                                            checked={selectedTasks.includes(task.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedTasks((prev) => [...prev, task.id]);
                                                                } else {
                                                                    setSelectedTasks((prev) => prev.filter((id) => id !== task.id));
                                                                }
                                                            }}
                                                            className='col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600'
                                                        />
                                                        <svg className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white' viewBox='0 0 14 14' fill='none'>
                                                            <path className='opacity-0 group-has-checked:opacity-100' d='M3 8L6 11L11 3.5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                                                        </svg>
                                                    </div>

                                                    <div className='min-w-0'>
                                                        <p className='text-sm font-medium text-gray-900 truncate'>{task.title}</p>

                                                        {(commentCounts?.[task.id] ?? 0) > 0 && (
                                                            <div className='mt-0.5 flex items-center gap-1 text-xs text-gray-500'>
                                                                <MessageCircle className='h-3.5 w-3.5' />
                                                                <span>{commentCounts?.[task.id] ?? 0}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {isDesktop && task.assignees?.includes(user?.email) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!user?._id) return;

                                                            if (timer?.task?._id === task.id) {
                                                                setSelectedProject(null);
                                                                setTrackingTask(null);
                                                                switchTask(null, null);
                                                                return;
                                                            }

                                                            setSelectedProject(task.project._id);
                                                            setTrackingTask(task.id);

                                                            if (!isTracking) {
                                                                start(user._id, task.project._id, task.id);
                                                            } else {
                                                                switchTask(task.project._id, task.id);
                                                            }
                                                        }}
                                                        className='shrink-0 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50'
                                                    >
                                                        {timer?.task?._id === task.id ? "Done" : "Start"}
                                                    </button>
                                                )}
                                            </div>

                                            <div className='mt-3 flex flex-wrap items-center gap-2'>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === "Low"
                                                        ? "bg-gray-200 text-gray-700"
                                                        : task.priority === "Medium"
                                                            ? "bg-blue-200 text-blue-700"
                                                            : "bg-red-200 text-red-700"
                                                    }`}>
                                                    {task.priority}
                                                </span>

                                                <span className='text-xs text-gray-600'>{task.status}</span>

                                                <span className={`text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                                                </span>
                                            </div>

                                            <div className='mt-2 flex items-center'>
                                                {task.assignedTo ? (
                                                    <>
                                                        {task.assignedTo.avatar?.trim() ? (
                                                            <Image
                                                                src={task.assignedTo.avatar}
                                                                alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                                                                width={20}
                                                                height={20}
                                                                unoptimized
                                                                className='h-5 w-5 rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            <div className='h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-semibold'>
                                                                {task.assignedTo.firstName?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className='ml-1.5 text-xs text-gray-700'>
                                                            {task.assignedTo.firstName} {task.assignedTo.lastName}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className='text-xs text-gray-400 italic'>Unassigned</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className='py-10 text-center text-gray-500'>No tasks found</p>
                            )}
                        </div>

                        {/* DESKTOP: table (sm and up) */}
                        <div className='hidden sm:block mt-4 flow-root overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8'>
                            <div className='inline-block min-w-full py-2 align-middle px-4 sm:px-6 lg:px-8'>
                                <table className='min-w-full divide-y divide-gray-300'>
                                    <thead className='sr-only'>
                                        <tr>
                                            <th>Select + Title</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Due Date</th>
                                            <th>Assignee</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className='divide-y divide-gray-200'>
                                        {filteredTasks.length > 0 ? (
                                            filteredTasks.map((task) => (
                                                <tr key={task.id}
                                                    onClick={async () => {
                                                        try {
                                                            await API.patch(`/tasks/${task.id}/comments/read`);
                                                            setCommentCounts((prev) => ({ ...prev, [task.id]: 0 }));
                                                        } catch (error) {
                                                            console.error("FAILED TO MARK COMMENTS AS READ:", error);
                                                        }
                                                        setSelectedTask(task);
                                                        setShowTaskModal(true);
                                                    }}
                                                    className={`hover:bg-gray-50 cursor-pointer ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"
                                                            ? "bg-red-50"
                                                            : ""
                                                        }`}
                                                >
                                                    <td className="px-3 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="group grid size-4 grid-cols-1">
                                                                <input
                                                                    type="checkbox"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    checked={selectedTasks.includes(task.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedTasks((prev) => [...prev, task.id]);
                                                                        } else {
                                                                            setSelectedTasks((prev) => prev.filter((id) => id !== task.id));
                                                                        }
                                                                    }}
                                                                    className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600"
                                                                />
                                                                <svg className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white" viewBox="0 0 14 14" fill="none">
                                                                    <path className="opacity-0 group-has-checked:opacity-100" d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>

                                                            <div className="ml-2 flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-900">{task.title}</span>
                                                                {(commentCounts?.[task.id] ?? 0) > 0 && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                                        <span>{commentCounts?.[task.id] ?? 0}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className='px-3 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                        <span className={`px-2 py-0.5 rounded-full ${task.priority === "Low"
                                                                ? "bg-gray-200 text-gray-700"
                                                                : task.priority === "Medium"
                                                                    ? "bg-blue-200 text-blue-700"
                                                                    : "bg-red-200 text-red-700"
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                    </td>

                                                    <td className='px-3 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                        <span className='text-gray-600'>{task.status}</span>
                                                    </td>

                                                    <td className={`px-3 py-4 whitespace-nowrap text-sm ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"
                                                            ? "text-red-600 font-semibold"
                                                            : "text-gray-500"
                                                        }`}>
                                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                                                    </td>

                                                    <td className='px-3 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                        {task.assignees.length === 0 ? (
                                                            <div className='text-gray-400'>Not assigned</div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                {task.assignedTo ? (
                                                                    <>
                                                                        {task.assignedTo.avatar?.trim() ? (
                                                                            <Image
                                                                                src={task.assignedTo.avatar}
                                                                                alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                                                                                width={28}
                                                                                height={28}
                                                                                unoptimized
                                                                                className="h-7 w-7 rounded-full border-2 border-white object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-7 w-7 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                                                                                {task.assignedTo.firstName?.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <span className="ml-2 mr-3 text-sm text-gray-700">
                                                                            {task.assignedTo.firstName} {task.assignedTo.lastName}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-4 whitespace-nowrap text-right">
                                                        {isDesktop && task.assignees?.includes(user?.email) && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!user?._id) return;

                                                                    if (timer?.task?._id === task.id) {
                                                                        setSelectedProject(null);
                                                                        setTrackingTask(null);
                                                                        switchTask(null, null);
                                                                        return;
                                                                    }

                                                                    setSelectedProject(task.project._id);
                                                                    setTrackingTask(task.id);

                                                                    if (!isTracking) {
                                                                        start(user._id, task.project._id, task.id);
                                                                    } else {
                                                                        switchTask(task.project._id, task.id);
                                                                    }
                                                                }}
                                                            >
                                                                {timer?.task?._id === task.id ? "Done" : "Start"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className='py-10 text-center text-gray-500'>No tasks found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showNewTaskModal && (
                <NewTask

                    setShowNewTaskModal={setShowNewTaskModal}
                    fetchTasks={fetchTasks}
                />
            )}

            {showTaskModal && (
                <TaskDetails
                    setShowTaskModal={setShowTaskModal}
                    selectedTask={selectedTask}
                    fetchTasks={fetchTasks}
                    readOnly={!!taskId}
                />
            )}

            {showRecentlyDeleted && (
                <RecentlyDeletedTasks
                    onClose={() => setShowRecentlyDeleted(false)}
                />
            )}
        </>
    )
}

