"use client";

import { useState } from "react";
import UserProfileModal from "@/components/UserProfilemodal";
import { useDashboard } from "@/context/DashboardContext";
import { mapUserToProfileData } from "@/utils/mapUserToProfileData";

export default function Page() {
    const [open, setOpen] = useState(false);

    const { user } = useDashboard();

    if (!user) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    const profileUser = mapUserToProfileData(user);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <button
                onClick={() => setOpen(true)}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
                View Profile
            </button>

            <UserProfileModal
                open={open}
                onClose={() => setOpen(false)}
                user={profileUser}
            />
        </main>
    );
}