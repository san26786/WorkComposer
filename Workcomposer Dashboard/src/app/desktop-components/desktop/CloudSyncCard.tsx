"use client";

import { Cloud, Check, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import API from "@/api";

export default function CloudSyncCard() {
    const [sync, setSync] = useState({
        status: "synced",
        pendingUploads: 0,
        lastSync: "",
    });

    useEffect(() => {
        const fetchSync = async () => {
            try {
                const { data } = await API.get("/sync/status");
                setSync(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchSync();

        const interval = setInterval(fetchSync, 10000);

        return () => clearInterval(interval);
    }, []);

    const lastSync = sync.lastSync
        ? new Date(sync.lastSync).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
          })
        : "--:--:--";

    return (
        <div className="relative h-[220px] overflow-hidden rounded-xl bg-[#17253D] p-5">

            {/* ========================= */}
            {/* BACKGROUND EFFECT */}
            {/* ========================= */}

            {/* Large blurred purple glow */}
            <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl animate-pulse"
            />

            {/* Bottom cloud glow */}
            <div
                className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl"
            />

            {/* Moving glow */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/5 blur-2xl animate-[cloudFloat_6s_ease-in-out_infinite]"
            />

            {/* Subtle grid/noise-like overlay */}
            
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:24px_24px]"
            />

            {/* ========================= */}
            {/* CONTENT */}
            {/* ========================= */}

            <div className="relative z-10">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div
                        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500 shadow-lg shadow-purple-500/20"
                    >
                        <Cloud className="h-4 w-4 text-white" />
                    </div>

                    <h3 className="mb-5 text-xs font-semibold text-gray-400">
                        CLOUD SYNC
                    </h3>
                </div>

                {/* Sync information */}
                <div className="space-y-4">

                    {/* Status */}
                    <div
                        className="flex justify-between rounded-lg border border-white/[0.03] bg-[#101B2D]/90 p-2 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-1">
                            {sync.status === "syncing" ? (
                                <RefreshCw
                                    className="h-3.5 w-3.5 animate-spin text-yellow-400"
                                />
                            ) : (
                                <Check
                                    className={`h-3.5 w-3.5 ${
                                        sync.status === "synced"
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }`}
                                />
                            )}

                            <span className="ml-1 text-xs font-semibold text-gray-300">
                                Status
                            </span>
                        </div>

                        <span
                            className={`mr-1 text-xs font-semibold ${
                                sync.status === "synced"
                                    ? "text-green-400"
                                    : sync.status === "syncing"
                                      ? "text-yellow-400"
                                      : "text-red-400"
                            }`}
                        >
                            {sync.status}
                        </span>
                    </div>

                    {/* Last Sync */}
                    <div
                        className="flex justify-between rounded-lg border border-white/[0.03] bg-[#101B2D]/90 p-2 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-purple-500" />

                            <span className="ml-1 text-xs font-semibold text-gray-300">
                                Last Sync
                            </span>
                        </div>

                        <span className="mr-1 text-xs font-semibold text-white">
                            {lastSync}
                        </span>
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* ANIMATION */}
            {/* ========================= */}

            <style jsx>{`
                @keyframes cloudFloat {
                    0%,
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                    }

                    50% {
                        transform: translate(-42%, -58%) scale(1.15);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    div {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}