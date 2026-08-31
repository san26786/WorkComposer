"use client";

import { useRouter } from "next/navigation";

import NotificationList from "@/components/notifications/NotificationList";
import type { Notification } from "@/hooks/useNotifications";

export default function NotificationsPage() {
    const router = useRouter();

    return (
        <NotificationList
            onNotificationClick={(notification: Notification) => {
                if (
                    notification.entityType === "task" &&
                    notification.entityId
                ) {
                    router.push(
                        `/dashboard/task-management?task=${notification.entityId}`,
                    );
                }
            }}
        />
    );
}