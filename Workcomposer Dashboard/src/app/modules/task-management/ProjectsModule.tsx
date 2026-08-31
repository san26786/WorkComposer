"use client";

import { useDesktop } from "@/context/DesktopContext";
import ProjectsSidebar from "./ProjectsSidebar";
import TaskManagement from "@/app/dashboard/task-management/TaskManagement";

type ProjectsModuleProps = {
    isDesktop?: boolean;
};

export default function ProjectsModule({
    isDesktop = false,
}: ProjectsModuleProps) {
    const { activeProject } = useDesktop();

    return (
        <div className="flex h-full pt-12">
            <div className="flex-1">
                <TaskManagement
                    selectedProject={activeProject}
                    isDesktop={isDesktop}
                />
            </div>
        </div>
    );
}