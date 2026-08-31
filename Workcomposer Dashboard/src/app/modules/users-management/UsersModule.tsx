"use client";

import { useDesktop } from "@/context/DesktopContext";
import TeamsManagement from "@/app/dashboard/user-management/TeamsManagement";

export default function UsersModule() {

    const {
        activeTeam,
    } = useDesktop();

    return (
        <div className="flex h-full">

            <div className="flex-1">

                <TeamsManagement
                    selectedTeam={activeTeam}
                />

            </div>

        </div>
    );
}