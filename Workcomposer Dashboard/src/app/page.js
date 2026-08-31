"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const DESKTOP_DOWNLOAD_URL =
    "https://github.com/Rahul-git-web/WorkComposer-Desktop/releases/download/v1.0.0/WorkComposer-Desktop-Setup-v1.0.0.exe";

  const [elapsed, setElapsed] = useState(14 * 60 + 32);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const timer = `${hours}:${minutes}:${seconds}`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* New Logo SVG */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 p-1.5 shadow-lg shadow-indigo-500/20">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path
                  d="M15 50 L35 75 L60 30"
                  stroke="white"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M45 50 L65 75 L90 30"
                  stroke="#93c5fd"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              Work<span className="text-indigo-400">Composer</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#download" className="hover:text-white transition-colors">
              Download
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/authenticate/login"
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 text-sm font-semibold transition"
            >
              Sign in
            </Link>

            <Link
              href="/authenticate/signup"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-md shadow-indigo-600/20"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/50 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                DESKTOP APP · WINDOWS
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                See where the day <br />
                actually{" "}
                <em className="italic bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent not-italic">
                  goes.
                </em>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                WorkComposer runs quietly in the background, logging focused
                time, app usage, and idle gaps — so your team spends less time
                reporting on work, and more time doing it.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={DESKTOP_DOWNLOAD_URL}
                  download
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-xl shadow-indigo-600/25 flex items-center gap-2.5"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3v13m0 0l-5-5m5 5l5-5M4 21h16" />
                  </svg>
                  Download for Windows
                </a>

                <a
                  href="#features"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  See how it works
                </a>
              </div>

              <p className="text-xs text-slate-500 pt-1">
                v1.0.0 · 313 MB · Windows 10/11
              </p>
            </div>

            {/* Mockup Frame */}
            <div className="lg:col-span-5 reveal">
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-auto text-xs text-slate-500 font-mono">
                    WorkComposer Desktop
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="h-2.5 bg-slate-800 rounded-full w-2/5" />
                  <div className="h-2.5 bg-slate-800/60 rounded-full w-3/4" />
                  <div className="h-2.5 bg-slate-800/40 rounded-full w-1/2" />
                </div>

                {/* Tracking Pill Widget */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/40 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <span className="block text-xl font-mono font-bold text-white tracking-wider">
                        {timer}
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">
                        Focused Session
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 h-6">
                    <span className="w-1 bg-indigo-500 rounded-full h-full animate-bounce" />
                    <span className="w-1 bg-indigo-400 rounded-full h-2/3 animate-bounce delay-100" />
                    <span className="w-1 bg-indigo-600 rounded-full h-4/5 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-b border-slate-800/40 bg-slate-950/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <b className="block text-3xl font-extrabold text-white font-mono">
                4.2M+
              </b>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                HOURS LOGGED
              </span>
            </div>
            <div>
              <b className="block text-3xl font-extrabold text-white font-mono">
                180+
              </b>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                COUNTRIES
              </span>
            </div>
            <div>
              <b className="block text-3xl font-extrabold text-white font-mono">
                1.0.0
              </b>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                CURRENT WINDOWS VERSION
              </span>
            </div>
            <div>
              <b className="block text-3xl font-extrabold text-white font-mono">
                &lt;1%
              </b>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                CPU AT IDLE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-16 reveal space-y-4">
            <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase bg-indigo-950/60 border border-indigo-800/40 px-3 py-1 rounded-full">
              FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Everything a manager needs. <br />
              Nothing an employee resents.
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Configurable tracking that respects the difference between
              &ldquo;watching work happen&rdquo; and &ldquo;watching
              people.&rdquo;
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            {[
              {
                title: "Screenshots, blurred by default",
                desc: "Capture cadence and blur intensity are set per workspace — from off, to lightly softened, to fully obscured.",
                icon: (
                  <path d="M3 4h18v14H3zM8 21h8M12 18v3" strokeWidth="1.8" />
                ),
              },
              {
                title: "Idle & activity detection",
                desc: "Mouse, keyboard, and window focus are sampled locally to tell real focus time from an open tab left running.",
                icon: (
                  <path
                    d="M12 7v5l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="1.8"
                  />
                ),
              },
              {
                title: "App & URL context",
                desc: "See which apps and domains time was spent in, grouped by project and task — never keystrokes, never content.",
                icon: <path d="M4 6h16M4 12h16M4 18h10" strokeWidth="1.8" />,
              },
              {
                title: "Shift-aware scheduling",
                desc: "Tracking can auto-start and stop with each person's shift, and pause itself for scheduled breaks.",
                icon: (
                  <path
                    d="M3 9h18M8 3v3M16 3v3M3 4h18v16H3z"
                    strokeWidth="1.8"
                  />
                ),
              },
              {
                title: "Synced across every device",
                desc: "Sign in once. Sessions, settings, and history follow across desktop installs without re-authenticating.",
                icon: <path d="M4 2h16v20H4zM9 18h6" strokeWidth="1.8" />,
              },
              {
                title: "A dashboard built for managers",
                desc: "Roll individual sessions up into team and project views without digging through raw logs.",
                icon: <path d="M3 17l6-6 4 4 8-8M13 6h8v8" strokeWidth="1.8" />,
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section
        id="privacy"
        className="py-24 border-b border-slate-800/40 bg-slate-950/30"
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Every setting here is visible to the person being tracked.
            </h2>
            <p className="text-slate-400 leading-relaxed">
              WorkComposer&rsquo;s monitoring options live in a settings panel
              every employee can open — not a hidden config file. What&rsquo;s
              on is on, in plain view, for everyone.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                "Screenshot blur strength is workspace-wide, not per-employee",
                "Location tracking is off by default and opt-in per workspace",
                "Tokens and screenshots are encrypted at rest and in transit",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <span className="p-1 rounded-md bg-indigo-950 border border-indigo-800/50 text-indigo-400 mt-0.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 reveal">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              {[
                {
                  label: "Screenshot capture",
                  detail: "Every 5 min, randomized ±20%",
                  active: true,
                },
                {
                  label: "Blur screenshots",
                  detail: "Maximum blurring",
                  active: true,
                },
                {
                  label: "IP-based location",
                  detail: "Workspace default: off",
                  active: false,
                },
                {
                  label: "Pause when inactive",
                  detail: "After 3 minutes idle",
                  active: true,
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <span className="block text-sm font-semibold text-white">
                      {row.label}
                    </span>
                    <span className="text-xs text-slate-500">{row.detail}</span>
                  </div>
                  <span
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      row.active ? "bg-indigo-600" : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        row.active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA Section */}
      <section id="download" className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center reveal">
          <div className="p-12 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-900/40 shadow-2xl space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Set it up in under two minutes.
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
              Install, sign in, and WorkComposer starts logging the moment you
              press start — or automatically, if your shift schedule says
              it&apos;s time.
            </p>

            <div className="pt-4 flex justify-center">
              <a
                href={DESKTOP_DOWNLOAD_URL}
                download
                className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-xl shadow-indigo-600/30 flex items-center gap-4"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="12" rx="1" />
                  <path d="M8 20h8M12 16v4" />
                </svg>
                <div className="text-left">
                  <b className="block text-base leading-none">Windows</b>
                  <span className="text-xs text-indigo-200">
                    v1.0.0 · .exe · 64-bit
                  </span>
                </div>
              </a>
            </div>

            <p className="text-xs text-slate-500 pt-4">
              Windows 10/11 · 313 MB · macOS & Linux coming soon
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 p-1">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path
                  d="M15 50 L35 75 L60 30"
                  stroke="white"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M45 50 L65 75 L90 30"
                  stroke="#93c5fd"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-bold text-white font-mono">WorkComposer</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#privacy" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#download" className="hover:text-white transition">
              Download
            </a>
          </div>

          <span className="text-xs text-slate-500">© 2026 WorkComposer</span>
        </div>
      </footer>
    </main>
  );
}
