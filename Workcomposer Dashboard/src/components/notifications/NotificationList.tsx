"use client";

import {
    Bell,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

import useNotifications from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import type { Notification } from "@/hooks/useNotifications";

type Props = {
    onNotificationClick?: (
        notification: Notification,
    ) => void;
};

export default function NotificationList({
    onNotificationClick,
}: Props) {
    const {
        notifications,
        unreadCount,
        loading,
        page,
        totalPages,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const handleNotificationClick = (
        notification: Notification,
    ) => {
        onNotificationClick?.(notification);
    };

    const goToPage = (nextPage: number) => {
        if (
            nextPage < 1 ||
            nextPage > totalPages ||
            nextPage === page
        ) {
            return;
        }

        fetchNotifications(nextPage);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex-1 py-6 sm:py-8 lg:py-10">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                                <Bell className="h-5 w-5 text-indigo-600" />
                            </div>

                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    Notifications
                                </h1>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    {unreadCount > 0
                                        ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                        : "You're all caught up"}
                                </p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div>
                        {loading ? (
                            <div className="flex h-72 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex h-72 flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <Bell className="h-6 w-6 text-gray-400" />
                                </div>

                                <h2 className="mt-4 text-sm font-semibold text-gray-800">
                                    No notifications
                                </h2>

                                <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                                    Notifications about tasks,
                                    tracking, and other
                                    activity will appear here.
                                </p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map(
                                    (notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onRead={markAsRead}
                                            onClick={
                                                handleNotificationClick
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    {!loading &&
                        notifications.length > 0 &&
                        totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 sm:px-7">
                                <p className="text-xs text-gray-500">
                                    Page {page} of {totalPages}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={page === 1}
                                        onClick={() =>
                                            goToPage(page - 1)
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            page === totalPages
                                        }
                                        onClick={() =>
                                            goToPage(page + 1)
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}