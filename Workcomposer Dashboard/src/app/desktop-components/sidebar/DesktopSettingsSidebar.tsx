"use client";

import { useDesktop } from "@/context/DesktopContext";
import SettingsSidebar from "@/app/modules/settings/SettingsSidebar";

export default function DesktopSettingsSidebar() {

    const {
        activeSetting,
        setActiveSetting,
    } = useDesktop();

    return (
        <SettingsSidebar
            desktop
            activeSetting={activeSetting}
            setActiveSetting={setActiveSetting}
        />
    );
}