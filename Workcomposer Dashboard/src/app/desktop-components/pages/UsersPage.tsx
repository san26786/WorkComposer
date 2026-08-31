"use client";

import UsersModule from "@/app/modules/users-management/UsersModule";
import DesktopPageHeader from "../common/DesktopPageHeader";

export default function UsersPage() {
    return (
        <>
            <DesktopPageHeader />

            <div className="pt-[45px]">
                <UsersModule />
            </div>
        </>
    );
}