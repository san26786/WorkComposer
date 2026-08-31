"use client";

import { useDesktop } from "@/context/DesktopContext";

import SecurityLayout from "@/app/dashboard/settings/account/security/layout";

import TwoFactorPage from "@/app/dashboard/settings/account/security/two-factor/page";
import AppUpdatePage from "@/app/dashboard/settings/account/security/app-update/page";
import AuditLogPage from "@/app/dashboard/settings/account/security/audit-log/page";

export default function SecurityModule() {

    const {
        activeSecurityTab,
        setActiveSecurityTab,
    } = useDesktop();

    const pages = {
        "two-factor": <TwoFactorPage />,
        "app-update": <AppUpdatePage />,
        "audit-log": <AuditLogPage />,
    };

    return (
        <SecurityLayout
            desktop
            activeSecurityTab={activeSecurityTab}
            setActiveSecurityTab={setActiveSecurityTab}
        >
            {pages[
                activeSecurityTab as keyof typeof pages
            ]}
        </SecurityLayout>
    );
}