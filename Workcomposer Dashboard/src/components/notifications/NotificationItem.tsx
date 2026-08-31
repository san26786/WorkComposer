"use client";

import {
    CheckCircle2,
    ClipboardList,
    Clock3,
    Info,
    UserPlus,
} from "lucide-react";

import type { Notification } from "@/hooks/useNotifications";

type Props = {
    notification: Notification;
    onRead: (id: string) => void;
    onClick?: (notification: Notification) => void;
};

function getNotificationIcon(type: string) {
    const className = "h-4 w-4 text-indigo-600";

    if (type.startsWith("TASK_")) {
        return <ClipboardList className={className} />;
    }

    if (type.startsWith("TRACKING_")) {
        return <Clock3 className={className} />;
    }

    if (
        type === "USER_INVITED" ||
        type === "USER_ADDED"
    ) {
        return <UserPlus className={className} />;
    }

    if (type === "TASK_COMPLETED") {
        return <CheckCircle2 className={className} />;
    }

    return <Info className={className} />;
}

function formatTime(date: string) {
    const value = new Date(date);
    const diff = Date.now() - value.getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    return value.toLocaleDateString();
}

export default function NotificationItem({
    notification,
    onRead,
    onClick,
}: Props) {
    return (
        <button
            type="button"
            onClick={() => {
                if (!notification.read) {
                    onRead(notification._id);
                }

                onClick?.(notification);
            }}
            className={`flex w-full gap-3 border-b border-gray-100 px-4 py-4 text-left transition hover:bg-gray-50 ${
                !notification.read
                    ? "bg-indigo-50/50"
                    : "bg-white"
            }`}
        >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                {getNotificationIcon(notification.type)}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={`text-sm ${
                            notification.read
                                ? "font-medium text-gray-700"
                                : "font-semibold text-gray-900"
                        }`}
                    >
                        {notification.title}
                    </p>

                    {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                    )}
                </div>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                    {notification.message}
                </p>

                <p className="mt-2 text-[11px] text-gray-400">
                    {formatTime(notification.createdAt)}
                </p>
            </div>
        </button>
    );
}