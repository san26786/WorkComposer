"use client";

import Sidebar from "@/app/desktop-components/desktop/Sidebar";
import TopBar from "../desktop-components/desktop/TopBar";
import FooterStatusBar from "../desktop-components/desktop/FooterStatusBar";
import DashboardPage from "../desktop-components/pages/DashboardPage";
import ReportsPage from "../desktop-components/pages/ReportsPage";
import UsersPage from "../desktop-components/pages/UsersPage";
import ProjectsPage from "../desktop-components/pages/ProjectsPage";
import SettingsPage from "../desktop-components/pages/SettingsPage";
import { TimerProvider } from "@/context/TimerContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { DesktopProvider, useDesktop } from "@/context/DesktopContext";
import { useEffect, useState } from "react";
import API from "@/api";
import DashboardContext from "@/context/DashboardContext";
import InboxPage from "../desktop-components/pages/InboxPage";
import NotificationList from "@/components/notifications/NotificationList";
import socket from "@/socket/socket";
import { useRouter } from "next/navigation";


function DesktopLayout() {

    const {
        activePage,
        setActivePage,
    } = useDesktop();

    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!window.electronAPI) return;

        const cleanup = window.electronAPI.onDeviceSignedOut(() => {

            // Clear renderer-side authentication if present
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");

            router.replace("/authenticate/login");
        });

        return cleanup;
    }, [router]);

    return (
        <div className="flex min-h-screen bg-[#1d1e1e]">

            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
            />

            <TopBar />

            <main
                className={`relative pt-16 pb-7 flex-1 bg-white overflow-auto transition-all duration-300 
        ${activePage === "reports" ||
                        activePage === "users" ||
                        activePage === "projects" ||
                        activePage === "settings" ||
                        activePage === "inbox" ||
                        activePage === "notifications"
                        ? "ml-[78px] xl:ml-[366px]"
                        : "ml-[78px]"
                    }`}
            >

                {activePage === "dashboard" && (
                    <div className="bg-[#191937]">
                        <DashboardPage />
                    </div>
                )}

                {activePage === "reports" && (
                    <div className="bg-white">
                        <ReportsPage />
                    </div>
                )}

                {activePage === "users" && (
                    <div className="bg-white">
                        <UsersPage />
                    </div>
                )}

                {activePage === "projects" && (
                    <div className="bg-white">
                        <ProjectsPage />
                    </div>
                )}

                {activePage === "settings" && (
                    <div className="bg-white">
                        <SettingsPage />
                    </div>
                )}

                {activePage === "inbox" && (
                    <div className="bg-white">
                        <InboxPage />
                    </div>
                )}

                {activePage === "notifications" && (
                    <div className="bg-white">
                        <NotificationList />
                    </div>
                )}

                <FooterStatusBar />

            </main>

        </div>
    );
}

export default function DesktopPage() {

    const [user, setUser] = useState<any>(null);

    const refreshUser = async () => {
        try {
            const res = await API.get("/auth/me");
            setUser(res.data);

            const organizationId =
                res.data.organization?._id || res.data.organization;

            if (organizationId) {
                socket.emit("joinOrganization", organizationId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";

        return () => {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        };
    }, []);

    return (
        <DashboardContext.Provider
            value={{
                user,
                refreshUser,
            }}
        >
            <DesktopProvider>
                <ProjectProvider>
                    <TimerProvider>
                        <DesktopLayout />
                    </TimerProvider>
                </ProjectProvider>
            </DesktopProvider>
        </DashboardContext.Provider>
    );
}
