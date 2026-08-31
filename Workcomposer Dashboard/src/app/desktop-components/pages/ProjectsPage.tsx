"use client";

import ProjectsModule from "@/app/modules/task-management/ProjectsModule";
import DesktopPageHeader from "../common/DesktopPageHeader";

export default function ProjectsPage() {
    return (
        <>
            <DesktopPageHeader />

            <div className="pt-[45px]">
                <ProjectsModule isDesktop />
            </div>
        </>
    );
}