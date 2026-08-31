"use client";

import { useState } from "react";
import API from "@/api";
import UserProfileModal from "@/components/UserProfilemodal";
import { mapUserToProfileData } from "@/utils/mapUserToProfileData";

type Props = {
    user: any;
    children: React.ReactNode;
    className?: string;
};

export default function UserProfileTrigger({
    user,
    children,
    className = "",
}: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileUser, setProfileUser] = useState<any>(null);

    if (!user) {
        return <>{children}</>;
    }

    const userId = user._id || user.id;

    const handleOpenProfile = async () => {
        if (!userId || loading) return;

        // Open immediately so there is no delayed mount/flicker.
        setOpen(true);
        setLoading(true);

        try {
            const { data } = await API.get(
                `/users/profile/${userId}`
            );

            setProfileUser(data);
        } catch (error: any) {
            console.error(
                "FAILED TO FETCH USER PROFILE:",
                error?.response?.data || error
            );

            // Close if profile couldn't be loaded.
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setProfileUser(null);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpenProfile}
                disabled={loading}
                className={`${className} ${loading ? "cursor-wait" : ""
                    }`}
                title="View profile"
            >
                {children}
            </button>

            <UserProfileModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setProfileUser(null);
                }}
                loading={loading}
                user={
                    profileUser
                        ? mapUserToProfileData(profileUser)
                        : undefined
                }
            />
        </>
    );
}