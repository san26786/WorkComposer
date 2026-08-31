"use client";

import { RxDashboard } from "react-icons/rx";
import {
  BarChart3,
  FolderKanban,
  Users,
  Settings,
  LifeBuoy,
  UserCircle,
} from "lucide-react";
import { GoSignOut } from "react-icons/go";
import { useState, useRef, useEffect } from "react";
import API from "@/api";
import { useDesktop } from "@/context/DesktopContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DesktopUsersSidebar from "@/app/desktop-components/sidebar/DesktopUsersSidebar";
import DesktopProjectsSidebar from "@/app/desktop-components/sidebar/DesktopProjectsSidebar";
import DesktopSettingsSidebar from "@/app/desktop-components/sidebar/DesktopSettingsSidebar";
import DesktopReportsSidebar from "../sidebar/DesktopReportsSidebar";
import DesktopInboxSidebar from "../sidebar/DesktopInboxSidebar";


type SidebarProps = {
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
};

export default function Sidebar({
  activePage,
  setActivePage,
}: SidebarProps) {

  const router = useRouter();

  const {
    activeReport,
    setActiveReport,
    moduleSidebarOpen,
    setModuleSidebarOpen,
  } = useDesktop();

  const {
    activeTeam,
    setActiveTeam,
    activeProject,
    setActiveProject,
  } = useDesktop();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setModuleSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, [setModuleSidebarOpen]);

  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [])

  const fetchUser = async () => {
    try {
      const { data } = await API.get("/auth/me");

      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const canManageUsersTeams =
    user?.permissions?.includes("manage_users");

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setShowProfile(false);

      // Clear Electron authentication + stop desktop tracking
      if (window.electronAPI) {
        await window.electronAPI.logoutElectron();
      }

      // Existing backend logout
      await API.post("/auth/logout");

      localStorage.removeItem("accessToken");

      toast.success("Logged out successfully");

      router.replace("/authenticate/login");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  };


  let currentSidebar: React.ReactNode = null;

  switch (activePage) {
    case "reports":
      currentSidebar = (
        <DesktopReportsSidebar
          activeReport={activeReport}
          setActiveReport={setActiveReport}
        />
      );
      break;

    case "users":
      currentSidebar = (
        <DesktopUsersSidebar
          activeTeam={activeTeam}
          setActiveTeam={setActiveTeam}
        />
      );
      break;

    case "projects":
      currentSidebar = (
        <DesktopProjectsSidebar
          activeProject={activeProject}
          setActiveProject={setActiveProject}
        />
      );
      break;

    case "settings":
      currentSidebar = <DesktopSettingsSidebar />;
      break;

    case "inbox":
      currentSidebar = <DesktopInboxSidebar />;
      break;
  }

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-[78px] bg-[#0F172A] border-r border-[#22324D] text-white flex flex-col justify-between z-40">
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center justify-center">
            <h1 className="text-2xl font-extrabold text-white">
              W
            </h1>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex flex-col items-center space-y-4">
            {/* Active Dashboard */}
            <button
              type="button"
              title="Dashboard"
              aria-label="Dashboard"
              onClick={() => setActivePage("dashboard")}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activePage === "dashboard"
                ? "bg-[#2563EB] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#17253D]"
                }`}
            >
              <RxDashboard size={22} />
            </button>

            <button
              type="button"
              title="Reports"
              aria-label="Reports"
              onClick={() => setActivePage("reports")}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activePage === "reports"
                ? "bg-[#2563EB] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#17253D]"
                }`}
            >
              <BarChart3 size={22} />
            </button>

            <button
              type="button"
              title="Projects"
              aria-label="Projects"
              onClick={() => setActivePage("projects")}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activePage === "projects"
                ? "bg-[#2563EB] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#17253D]"
                }`}
            >
              <FolderKanban size={22} />
            </button>

            {canManageUsersTeams && (
              <button
                type="button"
                title="Users"
                aria-label="Users"
                onClick={() => setActivePage("users")}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activePage === "users"
                    ? "bg-[#2563EB] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#17253D]"
                  }`}
              >
                <Users size={22} />
              </button>
            )}

            <button
              type="button"
              title="Settings"
              aria-label="Settings"
              onClick={() => setActivePage("settings")}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activePage === "settings"
                ? "bg-[#2563EB] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#17253D]"
                }`}
            >
              <Settings size={22} />
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pb-10 flex flex-col items-center gap-4">
          {/* <button type="button" title="Support" aria-label="Support" className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#17253D] transition-all">
            <LifeBuoy size={22} />
          </button> */}

          <div
            ref={profileRef}
            className="relative">

            <button
              onClick={() => setShowProfile(!showProfile)}
              type="button"
              title="Profile"
              aria-label="Profile"
              className="w-10 h-10 rounded-full overflow-hidden bg-[#17253D] border border-[#22324D]"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-sm font-bold">
                  {user
                    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
                    : <UserCircle size={22} />}
                </div>
              )}
            </button>

            {showProfile && (
              <div className="absolute bottom-5 left-19 w-[280px] bg-white rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95
            duration-200">

                <div className="p-5">

                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                    Organization
                  </p>

                  <h3 className="text-gray-700 text-lg font-bold mt-2">
                    {user?.organization?.name || "Unknown Organization"}
                  </h3>

                  <div className="flex items-center gap-3 mt-4">

                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-lg">
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                          </div>
                        )}
                      </div>

                      <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                    </div>

                    <div>
                      <h4 className="text-gray-800 text-[17px] font-bold">
                        {user
                          ? `${user.firstName} ${user.lastName}`
                          : "Loading..."}
                      </h4>

                      <p className="text-gray-400 text-sm font-semibold">
                        {user?.email}
                      </p>

                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />

                        <span className="text-green-600 text-xs font-normal">
                          {user?.role}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full h-12 bg-red-500 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold text-[15px] mt-3 flex items-center justify-center transition-colors"
                >
                  <GoSignOut className="h-4 w-4 mr-2" />
                  {loggingOut ? "Signing Out..." : "Sign Out"}
                </button>

              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Desktop Module Sidebar */}
      {currentSidebar && (
        <div className="hidden xl:block fixed left-[78px] top-16 bottom-0 w-72 overflow-y-auto z-30 hide-scrollbar">
          {currentSidebar}
        </div>
      )}

      {/* Mobile / Tablet Sidebar */}
      {moduleSidebarOpen && currentSidebar && (
        <div className="fixed inset-0 z-50 xl:hidden">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModuleSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="absolute left-[78px] top-16 bottom-0 w-72 bg-[#0F172A] shadow-2xl overflow-y-auto hide-scrollbar">

            <button
              onClick={() => setModuleSidebarOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10"
            >
              ✕
            </button>

            {currentSidebar}

          </div>

        </div>
      )}

    </>
  );
}