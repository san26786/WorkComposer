"use client";

import { useEffect, useState } from "react";

export default function IdlePage() {
    const [countdown, setCountdown] = useState(20);

    const progressColor =
        countdown <= 5
            ? "#EF4444"      // Red
            : countdown <= 10
                ? "#F97316"  // Orange
                : "#FACC15"; // Yellow

    const glowClass =
        countdown <= 5
            ? "drop-shadow-[0_0_14px_rgba(239,68,68,.9)] animate-pulse"
            : countdown <= 10
                ? "drop-shadow-[0_0_12px_rgba(249,115,22,.8)]"
                : "drop-shadow-[0_0_10px_rgba(250,204,21,.8)]";

    useEffect(() => {
        if (!window.electronAPI) return;

        window.electronAPI.onIdleCountdown(
            (data: { countdown: number }) => {

                setCountdown(data.countdown);
            }
        );
    }, []);

    useEffect(() => {
        if (!window.electronAPI) return;

        window.electronAPI.onIdleResumed(() => {

            setCountdown(20);
        });
    }, []);

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#1D3557] via-[#1A2F4B] to-[#13243D]">

           <div className="flex h-screen flex-col">

                {/* Content */}
               <div className="flex-1 flex flex-col items-center justify-center px-16 py-10">

                    {/* Icon */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/30">

                        <svg
                            className="h-10 w-10 text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v5l3 3m6-4a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>

                    </div>

                    <h1
                        className={`mt-8 text-4xl font-bold transition-colors ${countdown <= 5
                            ? "text-red-300"
                            : "text-white"
                            }`}
                    >
                        Are you still working?
                    </h1>

                    <p className="mt-5 max-w-lg text-center text-lg leading-8 text-slate-300">
                        No activity has been detected for a while.
                        Confirm below to continue tracking your work session.
                    </p>

                    {/* Countdown */}

                    <div className="mt-12 w-full max-w-xl">

                        <div className="text-center">

                            <h2
                                className={`text-8xl font-extrabold transition-colors duration-300 ${countdown <= 5
                                        ? "text-red-400"
                                        : countdown <= 10
                                            ? "text-orange-400"
                                            : "text-yellow-400"
                                    }`}
                            >
                                {countdown}
                            </h2>

                            <p className="mt-2 text-sm font-semibold tracking-[0.35em] uppercase text-slate-400">
                                Seconds Remaining
                            </p>

                        </div>

                        <div className="mt-8">

                            <div className="h-3 w-full overflow-hidden rounded-full bg-[#304968]">

                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-linear"
                                    style={{
                                        width: `${(countdown / 20) * 100}%`,
                                        background: progressColor,
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="border-t border-[#36557C] px-10 py-6">

                    <button
                        className="
                        h-14
                        w-full
                        rounded-xl
                        bg-gradient-to-r
                        from-green-500
                        to-emerald-600
                        text-lg
                        font-semibold
                        text-white
                        transition
                        hover:brightness-110
                        active:scale-[0.98]
                    "
                    >
                        Yes, I&apos;m Working
                    </button>

                </div>

            </div>

        </div>
    );
}