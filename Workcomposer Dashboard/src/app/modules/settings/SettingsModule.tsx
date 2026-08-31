"use client";

import { useDesktop } from "@/context/DesktopContext";
import ProfilePage from "@/app/dashboard/settings/profile/page";
import OrganizationProfilePage from "@/app/dashboard/settings/organization-profile/page";
import SecurityModule from "@/app/dashboard/settings/account/security/SecurityModule";
import RolesPrivilegesPage from "@/app/dashboard/settings/account/roles-privilages/page";
import IntegrationsPage from "@/app/dashboard/settings/account/integrations/page";
import ApiAccessPage from "@/app/dashboard/settings/account/api-access/page";
import BillingsPage from "@/app/dashboard/settings/account/billings/page";

import TrackingPage from "@/app/dashboard/settings/time-tracking/tracking/page";
import ScreenCapturePage from "@/app/dashboard/settings/time-tracking/screen-capture/page";
import ManualTimePage from "@/app/dashboard/settings/time-tracking/manual-time/page";
import ProductivityPage from "@/app/dashboard/settings/time-tracking/productivity/page";
import ShiftsPage from "@/app/dashboard/settings/time-tracking/shifts/page";
import EmailReportsPage from "@/app/dashboard/settings/time-tracking/email-reports/page";

import ProjectsPage from "@/app/dashboard/settings/task-management/projects/page";

export default function SettingsModule() {

    const { activeSetting } = useDesktop();


    const pages = {
        profile: <ProfilePage />,

        "organization-profile": <OrganizationProfilePage />,
        security: <SecurityModule />,
        "roles-privilages": <RolesPrivilegesPage />,
        integrations: <IntegrationsPage />,
        "api-access": <ApiAccessPage />,
        billings: <BillingsPage />,

        tracking: <TrackingPage />,
        "screen-capture": <ScreenCapturePage />,
        "manual-time": <ManualTimePage />,
        productivity: <ProductivityPage />,
        shifts: <ShiftsPage />,
        "email-reports": <EmailReportsPage />,

        projects: <ProjectsPage />,
    };

    return pages[
        activeSetting as keyof typeof pages
    ] ?? <ProfilePage />;
}