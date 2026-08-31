"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import Image from "next/image";
import logo from "@/assets/dashboard workcomposer logo.png";
import toast from "react-hot-toast";

type Props = {
    organizationName?: string;
};

export default function DesktopModuleHeader({
    organizationName = "XYZ Organization",
}: Props) {

    const [realOrganizationName, setRealOrganizationName] = useState(
    organizationName || "XYZ Organization"
);

useEffect(() => {
    const fetchOrganization = async () => {
        try {
            const { data } = await API.get("/auth/me");

            setRealOrganizationName(
                data?.organization?.name ||
                organizationName ||
                "XYZ Organization"
            );
        } catch (err) {
            toast.error("Failed to fetch organization");
        }
    };

    fetchOrganization();
}, [organizationName]);


    return (
        <div className="border-b border-gray-700 px-6 py-5">
            <Image
                src={logo}
                alt="WorkComposer"
                className="h-6 w-auto"
            />

            <p className="mt-2 text-xs font-semibold text-white">
                {realOrganizationName}
            </p>
        </div>
    );
}