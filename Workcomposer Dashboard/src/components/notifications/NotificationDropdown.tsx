"use client";

import {
    Bell,
    CheckCheck,
    Loader2,
} from "lucide-react";

import NotificationItem from "./NotificationItem";
import type { Notification } from "@/hooks/useNotifications";

type Props = {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    onRead: (id: string) => void;
    onMarkAllRead: () => void;
    onViewAll?: () => void;
    onNotificationClick?: (
        notification: Notification,
    ) => void;
};

export default function NotificationDropdown({
    notifications,
    unreadCount,
    loading,
    onRead,
    onMarkAllRead,
    onViewAll,
    onNotificationClick,
}: Props) {

    // NotificationItem expects onClick to always exist.
    // Keep the parent prop optional by providing a safe fallback.
    const handleNotificationClick =
        onNotificationClick ?? (() => {});

    return (
        <div className="absolute right-0 top-full z-[100] mt-3 w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                    </h3>

                    {unreadCount > 0 && (
                        <p className="mt-0.5 text-[11px] text-gray-500">
                            {unreadCount} unread
                        </p>
                    )}
                </div>

                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="max-h-[420px] overflow-y-auto">
                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <Bell className="h-5 w-5 text-gray-400" />
                        </div>

                        <p className="mt-3 text-sm font-medium text-gray-700">
                            No notifications
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            You&apos;re all caught up.
                        </p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                            onRead={onRead}
                            onClick={handleNotificationClick}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="border-t border-gray-200 p-2">
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="w-full rounded-lg py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                    >
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
}