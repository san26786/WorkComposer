"use client";

import ProjectsSidebar from "@/app/modules/task-management/ProjectsSidebar";

type Props = {
    activeProject: string;
    setActiveProject: React.Dispatch<React.SetStateAction<string>>;
};

export default function DesktopProjectsSidebar(props: Props) {
    return (
        <ProjectsSidebar
            {...props}
            desktop
        />
    );
}