"use client";

import {
    createContext,
    useContext,
    useState,
} from "react";

import type { ReactNode } from "react";

type ProjectContextType = {
    selectedProject: string | null;
    setSelectedProject: React.Dispatch<
        React.SetStateAction<string | null>
    >;

    selectedTask: string | null;
    setSelectedTask: React.Dispatch<
        React.SetStateAction<string | null>
    >;
};

const ProjectContext =
    createContext<ProjectContextType | null>(null);

type Props = {
    children: ReactNode;
};

export const ProjectProvider = ({
    children,
}: Props) => {

const [selectedProject, setSelectedProject] =
    useState<string | null>(null);

const [selectedTask, setSelectedTask] =
    useState<string | null>(null);

    return (
        <ProjectContext.Provider
            value={{
                selectedProject,
                setSelectedProject,
                selectedTask,
                setSelectedTask,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);

    if (!context) {
        throw new Error(
            "useProject must be used within ProjectProvider"
        );
    }

    return context;
};