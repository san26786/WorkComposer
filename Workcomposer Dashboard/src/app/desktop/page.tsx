"use client";

import dynamic from "next/dynamic";

const DesktopClient = dynamic(
    () => import("./DesktopClient"),
    {
        ssr: false,
    }
);

export default function DesktopPage() {
    return <DesktopClient />;
}