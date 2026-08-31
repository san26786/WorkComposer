"use client";

import { useDashboard } from "@/context/DashboardContext";
import { Building2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrganizationCard() {
    const { user } = useDashboard();

    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());

        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const currentTime = now
        ? now.toLocaleTimeString("en-IN", {
              timeZone:
                  user?.organization?.timezone || "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
          })
        : "--:--:--";

    const timezone =
        user?.reportTimezone === "Browser timezone"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : user?.reportTimezone || "Asia/Kolkata";

    return (
        <div className="relative h-[220px] overflow-hidden rounded-xl border border-[#22324D] bg-[#17253D] p-4 transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(22,163,74,0.25)]">

            {/* ========================= */}
            {/* BACKGROUND EFFECT */}
            {/* ========================= */}

            {/* Top-right green glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-500/20 blur-3xl animate-pulse" />

            {/* Bottom-left emerald glow */}
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

            {/* Moving center glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400/5 blur-2xl organization-float" />

            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.035] organization-grid" />

            {/* ========================= */}
            {/* CONTENT */}
            {/* ========================= */}

            <div className="relative z-10">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 shadow-[0_0_12px_rgba(22,163,74,0.6)]">
                        <Building2 className="h-4 w-4 text-white" />
                    </div>

                    <h3 className="mb-2 text-xs font-semibold uppercase text-gray-400">
                        ORGANIZATION
                    </h3>
                </div>

                {/* Organization name */}
                <p className="mb-3 text-sm font-bold text-white">
                    {user?.organization?.name ||
                        "Unknown Organization"}
                </p>

                {/* Timezone / Current time */}
                <div className="mt-3 flex border-t border-[#263852] pt-2">
                    <Clock className="mr-2 mt-1 h-3.5 w-3.5 shrink-0 text-green-500" />

                    <p className="min-w-0 truncate text-sm text-gray-400">
                        {timezone} •
                    </p>

                    <span className="ml-2 shrink-0 text-sm font-normal text-white">
                        {currentTime}
                    </span>
                </div>
            </div>

            {/* ========================= */}
            {/* ANIMATION */}
            {/* ========================= */}

            <style jsx>{`
                .organization-float {
                    animation: organizationFloat 6s ease-in-out infinite;
                }

                .organization-grid {
                    background-image:
                        linear-gradient(
                            rgba(255, 255, 255, 0.5) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(255, 255, 255, 0.5) 1px,
                            transparent 1px
                        );
                    background-size: 24px 24px;
                }

                @keyframes organizationFloat {
                    0%,
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                    }

                    50% {
                        transform: translate(-42%, -58%) scale(1.15);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .organization-float {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}