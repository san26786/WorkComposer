"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useContext } from "react";
import DashboardContext, { useDashboard } from "@/context/DashboardContext";
import { useEffect, useState } from 'react'
import {
    Plus,
    EllipsisVertical,
    Pencil,
    FolderClosed,
} from "lucide-react";
import { HiOutlineTrash } from "react-icons/hi2";
import API from "@/api";
import NewProject from "@/app/dashboard/task-management/NewProject";
import DeleteProject from "@/app/dashboard/task-management/DeleteProject";
import useDesktopNavigation from "@/hooks/useDesktopNavigation";
import DesktopModuleHeader from '../common/DesktopModuleHeader';

type ReportsSidebarProps = {
    activeProject?: string;
    setActiveProject?: React.Dispatch<React.SetStateAction<string>>;
    desktop?: boolean;
};
export default function ReportsSidebar({
    activeProject,
    setActiveProject,
    desktop = false,
}: ReportsSidebarProps) {

    const [projectSearch, setProjectSearch] = useState("");
    const [projects, setProjects] = useState<any[]>([]);
    const [openProjectMenu, setOpenProjectMenu] = useState<string | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const { closeSidebar } = useDesktopNavigation(desktop);
    const { user } = useDashboard();

    const canManageProjects =
        user?.role === "owner" ||
        user?.permissions?.includes("manage_projects");

    const searchParams = useSearchParams();

    const currentProject =
        activeProject ??
        searchParams.get("project") ??
        "Default Project";

    const router = useRouter();


    const navigate = (project: string, path: string) => {

        closeSidebar();

        if (setActiveProject) {
            setActiveProject(project);
            return;
        }

        router.push(path);
    };


    const fetchProjects = async () => {
        try {

            const res = await API.get("/projects");

            setProjects(res.data || []);

        } catch (err) {
            console.error(err);
        }
    }


    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter((project) =>
        project.name
            .toLowerCase()
            .includes(projectSearch.toLowerCase())
    );

    return (
        <>
            {desktop && (
                <DesktopModuleHeader />
            )}

            <div className="flex items-center justify-between *:mb-3 mt-2 px-6"></div>
            <div className="flex items-center justify-between *:mb-3 mt-2 px-6">
                {/* <h2 className="text-white font-semibold text-lg">Teams Projects</h2> */}
            </div>
            <div className="px-3">
                {canManageProjects && (
                    <button
                        onClick={() => setShowProjectModal(true)}
                        className="mb-4 inline-flex w-full items-center cursor-pointer justify-center gap-2 rounded-md bg-indigo-800 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                )}

                <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) =>
                        setProjectSearch(e.target.value)
                    }
                    className="mb-4 w-full rounded-md bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700"></input>
            </div>

            <nav className="flex flex-1 flex-col mt-2">
                <div className="space-y-1 max-h-[400px]">

                    {filteredProjects.map((project) => (
                        <div
                            key={project._id}
                            className="relative"
                        >
                            <div
                                onClick={() => {
                                    navigate(
                                        project.name,
                                        `/dashboard/task-management?project=${encodeURIComponent(project.name)}`
                                    );
                                }}
                                className={`py-2 group flex items-center justify-between cursor-pointer px-3 transition-all duration-200 ease-in-out ${currentProject === project.name
                                    ? "bg-gradient-to-r from-indigo-900/70 to-gray-800 shadow-md text-white border-l-3 border-indigo-500"
                                    : "text-gray-300 hover:bg-gray-800/50"
                                    }`}
                            >
                                <span className="flex items-center gap-x-2">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                                        <FolderClosed className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-150 text-indigo-300" />
                                    </div>

                                    <span className="text-sm font-bold">
                                        {project.name}
                                    </span>
                                </span>

                                {canManageProjects && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                setOpenProjectMenu(
                                                    openProjectMenu === project._id
                                                        ? null
                                                        : project._id
                                                );
                                            }}
                                            type="button"
                                            className="cursor-pointer p-1 hover:bg-gray-700 rounded-md"
                                            title="Project options"
                                            aria-label="Project options"
                                        >
                                            <EllipsisVertical className="h-5 w-5 text-gray-400 hover:text-white" />
                                        </button>

                                        {openProjectMenu === project._id && (
                                            <div
                                                role="menu"
                                                className="absolute right-0 mt-1 w-32 origin-top-right bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setEditingProject(project);
                                                        setShowEditProjectModal(true);
                                                        setOpenProjectMenu(null);
                                                    }}
                                                    className="flex items-center w-full px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-600"
                                                    role="menuitem"
                                                >
                                                    <Pencil className="h-5 w-5 mr-2" />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProject({
                                                            ...project,
                                                            taskCount: project.taskCount || 0,
                                                        });
                                                        setShowDeleteProjectModal(true);
                                                        setOpenProjectMenu(null);
                                                    }}
                                                    className="flex items-center w-full px-3 py-2 text-sm font-semibold text-red-400 hover:bg-gray-600"
                                                    role="menuitem"
                                                >
                                                    <HiOutlineTrash className="h-5 w-5 mr-2" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                </div>
            </nav>

            {showProjectModal && (
                <NewProject
                    setShowProjectModal={setShowProjectModal}
                    fetchProjects={fetchProjects}
                />
            )}

            {showEditProjectModal && (
                <NewProject
                    setShowProjectModal={setShowEditProjectModal}
                    editingProject={editingProject}
                    fetchProjects={fetchProjects}
                />
            )}

            {showDeleteProjectModal && (
                <DeleteProject
                    selectedProject={selectedProject}
                    setShowDeleteProjectModal={setShowDeleteProjectModal}
                    fetchProjects={fetchProjects}
                />
            )}
        </>
    )
}

