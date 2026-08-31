"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import axios from "axios";

export type ApiLog = {
    id: string;
    apiKey: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    createdAt: string;
};

export function useApiLogs(
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 10
) {

    const [logs, setLogs] = useState<ApiLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/api-logs", {
                params: {
                    startDate,
                    endDate,
                    page,
                    limit,
                },
            });

            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to fetch API logs."
                );
            } else {
                toast.error("Failed to fetch API logs.");
            }
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, page, limit]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return {
        logs,
        loading,
        pagination,
        fetchLogs,
    };
}