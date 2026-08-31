"use client";

import { useEffect, useState } from "react";
import { TimerProvider } from "@/context/TimerContext";
import API from "@/api";
import DashNavbar from "./dashnavbar";
import Sidebar from "./sidebar";
import EditTime from "@/app/dashboard/time-tracking/overview/EditTime";
import DashboardContext from "@/context/DashboardContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { useRouter, usePathname } from "next/navigation";
import Inbox from "@/app/components/Inbox";
import socket from "@/socket/socket";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  useEffect(() => {
    const open = () => setShowModal(true);
    window.addEventListener("openManualTime", open);

    return () => window.removeEventListener("openManualTime", open);
  }, []);

  useEffect(() => {
    const toggleInbox = () => {
      setShowInbox((prev) => !prev);
    };

    window.addEventListener("toggleInbox", toggleInbox);

    return () => {
      window.removeEventListener("toggleInbox", toggleInbox);
    };
  }, []);

  const refreshUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);

      const organizationId =
        res.data.organization?._id || res.data.organization;

      if (organizationId) {
        socket.emit("joinOrganization", organizationId);
      }
    } catch {
      router.replace("/authenticate/login");
    }
  };

  useEffect(() => {
    refreshUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    if (
      pathname.startsWith("/dashboard/user-management") &&
      !user.permissions?.includes("manage_users")
    ) {
      router.replace("/dashboard/time-tracking/overview");
    }

    if (
      pathname.startsWith("/dashboard/settings") &&
      pathname !== "/dashboard/settings/profile" &&
      !user.permissions?.includes("manage_settings")
    ) {
      router.replace("/dashboard/settings/profile");
    }

    if (
      pathname.startsWith("/dashboard/time-tracking/screenshots") &&
      user?.screenshotAccess === "none"
    ) {
      router.replace("/dashboard/time-tracking/overview");
    }

    if (
      pathname.startsWith("/dashboard/time-tracking/location") &&
      !user.permissions?.includes("manage_users")
    ) {
      router.replace("/dashboard/time-tracking/overview");
    }
  }, [pathname, user, router]);

  useEffect(() => {
    setShowInbox(false);
  }, [pathname]);

  if (!user) return null;

  return (
    <DashboardContext.Provider
      value={{
        user,
        refreshUser,
      }}
    >
      <ProjectProvider>
        <TimerProvider>
          <div
            className={`h-screen transition-all duration-300 ${
              showModal ? "blur-sm brightness-75 scale-[0.98]" : ""
            }`}
          >
            <div className="flex h-full overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashNavbar />
                <main className="flex-1 overflow-y-auto bg-gray-100">
                  {children}
                </main>
              </div>
            </div>
          </div>

          {showModal && (
            <>
              <div
                onClick={() => setShowModal(false)}
                className="fixed inset-0 z-40 bg-black/30"
              />

              <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <EditTime onClose={() => setShowModal(false)} />
              </div>
            </>
          )}

          {showInbox && (
            <>
              <div
                onClick={() => setShowInbox(false)}
                className="fixed inset-0 bg-black/20"
              />

              <div className="fixed top-16 bottom-0 left-72 right-0 z-50 flex overflow-hidden">
                <div className="w-full bg-white shadow-2xl overflow-y-auto">
                  <Inbox />
                </div>
              </div>
            </>
          )}
        </TimerProvider>
      </ProjectProvider>
    </DashboardContext.Provider>
  );
}
