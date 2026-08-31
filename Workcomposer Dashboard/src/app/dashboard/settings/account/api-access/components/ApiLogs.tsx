"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useApiLogs } from "../hooks/useApiLogs";
import DateRangePicker from "./DateRangePicker";

export default function ApiLogs() {
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });
    const [page, setPage] = useState(1);

    const { logs, loading, pagination } = useApiLogs(
        dateRange.startDate,
        dateRange.endDate,
        page
    );


    if (loading) {
        return (
            <div className="flex h-72 items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!logs.length) {
        return (
            <div className="flex h-72 items-center justify-center">
                <p className="text-lg text-gray-500">
                    You have no API Logs yet.
                </p>
            </div>
        );
    }

    const startItem =
        pagination.total === 0
            ? 0
            : (pagination.page - 1) * pagination.limit + 1;

    const endItem = Math.min(
        pagination.page * pagination.limit,
        pagination.total
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Filters */}
            <div className="w-full max-w-md">
                <DateRangePicker
                    value={{
                        from: dateRange.startDate
                            ? new Date(dateRange.startDate)
                            : undefined,
                        to: dateRange.endDate
                            ? new Date(dateRange.endDate)
                            : undefined,
                    }}
                    onChange={(range) => {
                        setPage(1);

                        setDateRange({
                            startDate: range?.from
                                ? format(range.from, "yyyy-MM-dd")
                                : "",
                            endDate: range?.to
                                ? format(range.to, "yyyy-MM-dd")
                                : "",
                        });
                    }}
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold">
                                API Key
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                                Method
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                                Endpoint
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                                Status
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                                Response
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                                Time
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.map((log) => (
                            <tr
                                key={log.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    {log.apiKey}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${log.method === "GET"
                                            ? "bg-green-100 text-green-700"
                                            : log.method === "POST"
                                                ? "bg-blue-100 text-blue-700"
                                                : log.method === "PATCH"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : log.method === "DELETE"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {log.method}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                                        {log.endpoint}
                                    </code>
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${log.statusCode >= 200 && log.statusCode < 300
                                            ? "bg-green-100 text-green-700"
                                            : log.statusCode >= 300 && log.statusCode < 400
                                                ? "bg-blue-100 text-blue-700"
                                                : log.statusCode >= 400 && log.statusCode < 500
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {log.statusCode}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {log.responseTime} ms
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(log.createdAt).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing {startItem}-{endItem} of {pagination.total} API logs
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm font-medium">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() =>
                            setPage((prev) =>
                                Math.min(prev + 1, pagination.totalPages)
                            )
                        }
                        disabled={page === pagination.totalPages}
                        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}