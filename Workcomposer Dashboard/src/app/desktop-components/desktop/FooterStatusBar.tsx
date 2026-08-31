"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import API from "@/api";

export default function FooterStatusBar() {
    const [isOnline, setIsOnline] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    const fetchSyncStatus = async () => {
        try {
            setSyncing(true);

            const { data } = await API.get("/sync/status");

            setLastSync(
                data.lastSync ? new Date(data.lastSync) : null
            );
        } catch (err) {
            console.error(err);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchSyncStatus();

        const interval = setInterval(() => {
            fetchSyncStatus();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const formatLastSync = (date: Date | null) => {
        if (!date) return "Never synced";

        return date.toLocaleString([], {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 h-7 overflow-hidden border-t border-[#22324D] bg-[#111827] text-[12px]">

            {/* Ambient background effects */}
            <div className="pointer-events-none absolute -left-10 top-1/2 h-16 w-32 -translate-y-1/2 rounded-full bg-green-500/5 blur-2xl" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-2xl" />

            <div className="pointer-events-none absolute -right-10 top-1/2 h-16 w-32 -translate-y-1/2 rounded-full bg-purple-500/5 blur-2xl" />

            {/* Subtle animated glow */}
            <div className="pointer-events-none absolute inset-0 footer-glow" />

            {/* Content */}
            <div className="relative z-10 flex h-full items-center justify-between px-4">

                {/* Left */}
                <div className="flex items-center gap-7 pl-5">

                    {/* Online / Offline */}
                    <div
                        className={`flex items-center gap-2 rounded-sm bg-[#16253D] px-2 py-1 transition-all duration-300 ${
                            isOnline
                                ? "hover:shadow-[0_0_14px_rgba(74,222,128,0.3)]"
                                : "hover:shadow-[0_0_14px_rgba(239,68,68,0.25)]"
                        }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                isOnline
                                    ? "animate-pulse bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]"
                                    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                            }`}
                        />

                        <span className="text-white">
                            {isOnline ? "Online" : "Offline"}
                        </span>
                    </div>

                    {/* Sync status */}
                    <div className="flex items-center gap-2 font-semibold text-gray-300">
                        <RefreshCw
                            size={13}
                            className={`transition-all duration-300 ${
                                syncing
                                    ? "animate-spin text-blue-400"
                                    : "text-gray-400"
                            }`}
                        />

                        <span>
                            Synced {formatLastSync(lastSync)}
                        </span>
                    </div>
                </div>

                {/* Right */}
                <div className="text-gray-400">
                    v1.0.0 © 2026 WorkComposer
                </div>
            </div>

            <style jsx>{`
                .footer-glow {
                    background:
                        radial-gradient(
                            circle at 20% 50%,
                            rgba(34, 197, 94, 0.025),
                            transparent 30%
                        ),
                        radial-gradient(
                            circle at 50% 50%,
                            rgba(59, 130, 246, 0.025),
                            transparent 35%
                        ),
                        radial-gradient(
                            circle at 80% 50%,
                            rgba(168, 85, 247, 0.025),
                            transparent 30%
                        );
                    animation: footerAmbient 8s ease-in-out infinite;
                }

                @keyframes footerAmbient {
                    0%,
                    100% {
                        opacity: 0.7;
                    }

                    50% {
                        opacity: 1;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .footer-glow {
                        animation: none;
                    }
                }
            `}</style>
        </footer>
    );
}