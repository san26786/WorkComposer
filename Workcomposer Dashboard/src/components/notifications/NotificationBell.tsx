"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import socket from "@/socket/socket";
import useNotifications from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";
import { useOptionalDesktop } from "@/context/DesktopContext";

export default function NotificationBell() {
    const router = useRouter();
    const desktop = useOptionalDesktop();

    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent,
        ) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
    }, []);

    useEffect(() => {
        if (!desktop) {
            return;
        }

        const handleNewNotification = (
            notification: Notification,
        ) => {
            window.electronAPI?.showSystemNotification(
                notification.title,
                notification.message,
            );
        };

        socket.on(
            "notification:new",
            handleNewNotification,
        );

        return () => {
            socket.off(
                "notification:new",
                handleNewNotification,
            );
        };
    }, [desktop]);

    const handleNotificationClick = (
        notification: Notification,
    ) => {
        if (
            notification.entityType === "task" &&
            notification.entityId
        ) {
            setOpen(false);

            if (desktop) {
                desktop.setActivePage("task-management");
                return;
            }

            router.push(
                `/dashboard/task-management?task=${notification.entityId}`,
            );
        }
    };

    const handleViewAll = () => {
        setOpen(false);

        if (desktop) {
            desktop.setActivePage("notifications");
            return;
        }

        router.push("/dashboard/notifications");
    };

    return (
        <div
            ref={containerRef}
            className="relative"
        >
            <button
                type="button"
                aria-label="Notifications"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-w-[17px] h-[17px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    loading={loading}
                    onRead={markAsRead}
                    onMarkAllRead={markAllAsRead}
                    onViewAll={handleViewAll}
                    onNotificationClick={
                        handleNotificationClick
                    }
                />
            )}
        </div>
    );
}