"use client";

import { useDesktop } from "@/context/DesktopContext";

export default function useDesktopNavigation(enabled = true) {
    if (!enabled) {
        return {
            closeSidebar: () => {},
        };
    }

    const { setModuleSidebarOpen } = useDesktop();

    return {
        closeSidebar: () => {
            setModuleSidebarOpen(false);
        },
    };
}