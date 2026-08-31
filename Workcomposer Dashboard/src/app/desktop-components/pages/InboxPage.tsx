"use client";

import DesktopPageHeader from "../common/DesktopPageHeader";
import InboxSidebar from "@/app/desktop-components/sidebar/DesktopInboxSidebar";
import InboxModule from "@/app/modules/inbox/InboxModule";

export default function InboxPage() {
    return (
        <>
            <DesktopPageHeader />

            <div className="h-[calc(100vh-64px)]">
                <InboxModule />
            </div>
        </>
    );
}