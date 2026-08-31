"use client";

import { Play, Square, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function TrackingBar() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let todayWorkSeconds = 0;
        let isTracking = false;

        const updateTimer = () => {
            if (!isTracking || !startTime) {
                setSeconds(0);
                return;
            }

            const elapsed = Math.floor(
                (Date.now() - startTime) / 1000
            );

            setSeconds(todayWorkSeconds + elapsed);
        };

        const removeListener = window.electronAPI.onTrackingUpdate((data) => {
            isTracking = Boolean(data.isTracking);

            todayWorkSeconds = Number(data.todayWorkSeconds || 0);

            if (data.startTime) {
                startTime = new Date(data.startTime).getTime();
            }

            updateTimer();
        });

        const interval = setInterval(updateTimer, 1000);

        return () => {
            clearInterval(interval);
            removeListener?.();
        };
    }, []);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    return (
        <div
            className="fixed inset-0 overflow-hidden bg-transparent flex items-center justify-center select-none"
            style={
                {
                    WebkitAppRegion: "drag",
                } as any
            }
        >
            <div
                className="
                    relative
                    h-12
                    min-w-[355px]
                    max-w-[400px]
                    rounded-2xl
                    border
                    border-white/15
                    bg-gradient-to-r
                    from-[#0f172a]/95
                    via-[#261042]/90
                    to-[#110f36]/95
                    shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)_inset]
                    backdrop-blur-2xl
                    flex
                    items-center
                    justify-between
                    px-4
                    text-white
                    overflow-hidden
                "
            >
                {/* Multi-Color Ambient Glow Spheres */}
                <div className="pointer-events-none absolute -left-6 -top-8 h-20 w-20 rounded-full bg-cyan-500/30 blur-xl" />
                <div className="pointer-events-none absolute left-1/3 -bottom-8 h-20 w-24 rounded-full bg-fuchsia-500/30 blur-xl" />
                <div className="pointer-events-none absolute right-12 -top-6 h-16 w-16 rounded-full bg-violet-500/30 blur-lg" />
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-indigo-500/30 blur-xl" />

                {/* Top Multi-Color Neon Border Accent */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-cyan-400/50 via-fuchsia-400/60 to-indigo-400/60" />

                {/* Left: Indicator, Timer, and Status */}
                <div className="relative z-10 flex items-center gap-2.5">
                    {/* Glowing status pill with blinking green pulse */}
                    <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-400/40 shadow-[0_0_14px_rgba(99,102,241,0.35)]">
                        <Play
                            size={9}
                            fill="currentColor"
                            className="text-indigo-300 translate-x-[0.5px]"
                        />
                        {/* Blinking Green Pulse Dot */}
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                        </span>
                    </div>

                    {/* Timer */}
                    <span className="font-mono text-[15px] font-bold tracking-wider text-slate-100 tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {time}
                    </span>

                    {/* Status Badge in Indigo with Green Blinking Dot */}
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 border border-indigo-400/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        Working
                    </span>
                </div>

                {/* Right: Actions Container */}
                <div
                    className="relative z-10 flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md"
                    style={
                        {
                            WebkitAppRegion: "no-drag",
                        } as any
                    }
                >
                    {/* Stop Button */}
                    <button
                        type="button"
                        onClick={() => {
                            window.electronAPI.stopTrackingFromBar();
                        }}
                        title="Stop tracking"
                        className="
                            group
                            h-7
                            w-7
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-transparent
                            hover:bg-rose-500/25
                            active:scale-90
                            transition-all
                            duration-150
                            cursor-pointer
                        "
                    >
                        <Square
                            size={10}
                            fill="currentColor"
                            className="text-slate-300 transition-colors duration-150 group-hover:text-rose-300 group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                        />
                    </button>

                    {/* Divider */}
                    <div className="h-3 w-px bg-white/15" />

                    {/* Expand Button */}
                    <button
                        type="button"
                        onClick={() => {
                            window.electronAPI.openMainWindow();
                        }}
                        title="Open dashboard"
                        className="
                            group
                            h-7
                            w-7
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-transparent
                            hover:bg-indigo-500/25
                            active:scale-90
                            transition-all
                            duration-150
                            cursor-pointer
                        "
                    >
                        <ChevronRight
                            size={14}
                            className="text-slate-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-indigo-200"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}