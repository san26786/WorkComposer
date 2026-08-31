"use client";

import SettingsModule from "@/app/modules/settings/SettingsModule";
import DesktopPageHeader from "../common/DesktopPageHeader";

export default function SettingsPage() {
    return (
        <>
            <DesktopPageHeader />

            <div className="pt-[45px]">
                <SettingsModule />
            </div>
        </>
    );
}