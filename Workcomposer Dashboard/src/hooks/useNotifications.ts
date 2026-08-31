"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import socket from "@/socket/socket";
import toast from "react-hot-toast";

export type Notification = {
    _id: string;
    recipient: string;
    organization: string;
    type: string;
    title: string;
    message: string;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, any>;
    read: boolean;
    readAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

type NotificationResponse = {
    notifications: Notification[];
    unreadCount: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export default function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchNotifications = useCallback(async (requestedPage = 1) => {
        try {
            setLoading(true);

            const { data } =
                await API.get<NotificationResponse>(
                    `/notifications?page=${requestedPage}&limit=20`,
                );

            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
            setPage(data.pagination.page);
            setTotalPages(data.pagination.totalPages);
        } catch (error: any) {
            console.error(
                "FETCH NOTIFICATIONS ERROR:",
                error,
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(
        async (id: string) => {
            try {
                await API.patch(
                    `/notifications/${id}/read`,
                );

                setNotifications((current) =>
                    current.map((notification) =>
                        notification._id === id
                            ? {
                                ...notification,
                                read: true,
                                readAt: new Date().toISOString(),
                            }
                            : notification,
                    ),
                );

                setUnreadCount((count) =>
                    Math.max(count - 1, 0),
                );
            } catch (error: any) {
                console.error(
                    "MARK NOTIFICATION READ ERROR:",
                    error,
                );

                toast.error(
                    "Failed to update notification.",
                );
            }
        },
        [],
    );

    const markAllAsRead = useCallback(async () => {
        try {
            await API.patch(
                "/notifications/read-all",
            );

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    read: true,
                    readAt:
                        notification.readAt ??
                        new Date().toISOString(),
                })),
            );

            setUnreadCount(0);
        } catch (error: any) {
            console.error(
                "MARK ALL NOTIFICATIONS READ ERROR:",
                error,
            );

            toast.error(
                "Failed to mark notifications as read.",
            );
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleNewNotification = (
            notification: Notification,
        ) => {
            setNotifications((current) => {
                const exists = current.some(
                    (item) =>
                        item._id === notification._id,
                );

                if (exists) {
                    return current;
                }

                return [
                    notification,
                    ...current,
                ].slice(0, 20);
            });

            if (!notification.read) {
                setUnreadCount((count) => count + 1);
            }
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
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        page,
        totalPages,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}