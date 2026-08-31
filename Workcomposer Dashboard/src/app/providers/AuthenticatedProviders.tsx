"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import API from "@/api";
import socket from "@/socket/socket";
import DashboardContext from "@/context/DashboardContext";

type Props = {
    children: React.ReactNode;
};

export default function AuthenticatedProviders({
    children,
}: Props) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const res = await API.get("/auth/me");

            setUser(res.data);

            const organizationId =
                res.data.organization?._id ||
                res.data.organization;

            if (organizationId) {
                socket.emit(
                    "joinOrganization",
                    organizationId
                );
            }
        } catch (error) {
            console.error(
                "FAILED TO LOAD AUTH USER:",
                error
            );

            router.replace("/authenticate/login");
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    if (!user) {
        return null;
    }

    return (
        <DashboardContext.Provider
            value={{
                user,
                refreshUser,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}