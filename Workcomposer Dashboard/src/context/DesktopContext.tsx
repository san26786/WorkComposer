"use client";

import {
    createContext,
    useContext,
    useState,
} from "react";

import type { ReactNode } from "react";

type DesktopContextType = {
    activePage: string;
    setActivePage: React.Dispatch<React.SetStateAction<string>>;

    activeReport: string;
    setActiveReport: React.Dispatch<React.SetStateAction<string>>;

    activeUserSection: string;
    setActiveUserSection: React.Dispatch<React.SetStateAction<string>>;

    selectedTeam: string;
    setSelectedTeam: React.Dispatch<React.SetStateAction<string>>;

    activeTeam: string;
    setActiveTeam: React.Dispatch<React.SetStateAction<string>>;

    activeProject: string;
    setActiveProject: React.Dispatch<React.SetStateAction<string>>;

    activeSetting: string;
    setActiveSetting: React.Dispatch<React.SetStateAction<string>>;

    activeSecurityTab: string;
    setActiveSecurityTab: React.Dispatch<
        React.SetStateAction<string>
    >;

    activeInbox: string;
    setActiveInbox: React.Dispatch<
        React.SetStateAction<string>
    >;

    moduleSidebarOpen: boolean;
    setModuleSidebarOpen: React.Dispatch<
        React.SetStateAction<boolean>
    >;
};

const DesktopContext =
    createContext<DesktopContextType | null>(null);

export function DesktopProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [activePage, setActivePage] =
        useState("dashboard");

    const [activeReport, setActiveReport] =
        useState("overview");

    const [activeUserSection, setActiveUserSection] =
        useState("teams");

    const [selectedTeam, setSelectedTeam] =
        useState("All Teams");

    const [activeTeam, setActiveTeam] = useState("All Teams");

    const [activeProject, setActiveProject] =
        useState("Default Project");

    const [activeSetting, setActiveSetting] =
        useState("profile");

    const [activeSecurityTab, setActiveSecurityTab] =
        useState("two-factor");

    const [activeInbox, setActiveInbox] =
        useState("manual-time");

    const [moduleSidebarOpen, setModuleSidebarOpen] =
        useState(false);


    return (
        <DesktopContext.Provider
            value={{
                activePage,
                setActivePage,

                activeReport,
                setActiveReport,

                activeUserSection,
                setActiveUserSection,

                selectedTeam,
                setSelectedTeam,

                activeTeam,
                setActiveTeam,

                activeProject,
                setActiveProject,

                activeSetting,
                setActiveSetting,

                activeSecurityTab,
                setActiveSecurityTab,

                activeInbox,
                setActiveInbox,

                moduleSidebarOpen,
                setModuleSidebarOpen,

            }}
        >
            {children}
        </DesktopContext.Provider>
    );
}

export function useDesktop() {
    const context = useContext(DesktopContext);

    if (!context) {
        throw new Error(
            "useDesktop must be used within DesktopProvider"
        );
    }

    return context;
}

export function useOptionalDesktop() {
    return useContext(DesktopContext);
}