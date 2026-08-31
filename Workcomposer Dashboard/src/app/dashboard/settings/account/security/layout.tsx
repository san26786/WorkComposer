"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BsLock } from "react-icons/bs";
import { IoArrowUpCircleOutline } from "react-icons/io5";
import { IoSearchCircleOutline } from "react-icons/io5";

type Props = {
    children: React.ReactNode;

    desktop?: boolean;

    activeSecurityTab?: string;

    setActiveSecurityTab?: React.Dispatch<
        React.SetStateAction<string>
    >;
};

export default function SecurityLayout({
    children,
    desktop = false,
    activeSecurityTab,
    setActiveSecurityTab,
}: Props) {
    const pathname = usePathname();

    const isActive = (key: string, path: string) =>
        desktop
            ? activeSecurityTab === key
            : pathname.includes(path);

    return (
        <div className="py-10 flex-1">
            <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                <div className="min-h-[calc(100vh-250px)] px-2 sm:px-4">

                    {/* Mobile tabs will come here */}
                    <div className="sm:hidden mb-6 px-6">
                        <div className="relative">

                            <select
                                value={pathname}
                                onChange={(e) => {
                                    window.location.href = e.target.value;
                                }}
                                className="w-full appearance-none rounded-md bg-wc-surface-2 py-3 pr-10 pl-4 text-base border border-wc-border focus:outline-none focus:ring-2 focus:ring-wc-primary focus:border-wc-primary"
                            >
                                <option value="/dashboard/settings/account/security/two-factor">
                                    Two Factor Authentication
                                </option>

                                <option value="/dashboard/settings/account/security/app-update">
                                    App Updates
                                </option>

                                <option value="/dashboard/settings/account/security/audit-log">
                                    Audit Log
                                </option>

                            </select>

                        </div>
                    </div>

                    {/* Desktop tabs */}
                    <div className="hidden sm:block mb-6 px-6">
                        <nav
                            className="flex gap-6 border-b border-wc-border"
                            aria-label="Tabs"
                        >

                            {desktop ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveSecurityTab?.("two-factor")
                                    }
                                    className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${isActive("two-factor", "/two-factor")
                                        ? "border-wc-primary text-wc-primary-text"
                                        : "border-transparent text-wc-text-3 hover:text-wc-text hover:border-wc-border"
                                        }`}
                                >
                                    <BsLock className="w-4 h-4" />
                                    Two Factor Authentication
                                </button>
                            ) : (
                                <Link
                                    href="/dashboard/settings/account/security/two-factor"
                                    className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${isActive("two-factor", "/two-factor")
                                        ? "border-wc-primary text-wc-primary-text"
                                        : "border-transparent text-wc-text-3 hover:text-wc-text hover:border-wc-border"
                                        }`}
                                >
                                    <BsLock className="w-4 h-4" />
                                    Two Factor Authentication
                                </Link>
                            )}


                            {desktop ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveSecurityTab?.("app-update")
                                    }
                                    className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${isActive("app-update", "/app-update")
                                        ? "border-wc-primary text-wc-primary-text"
                                        : "border-transparent text-wc-text-3 hover:text-wc-text hover:border-wc-border"
                                        }`}
                                >
                                    <IoArrowUpCircleOutline className="w-4 h-4" />
                                    App Updates
                                </button>
                            ) : (
                                <Link
                                    href="/dashboard/settings/account/security/app-update"
                                    className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${isActive("app-update", "/app-update")
                                        ? "border-wc-primary text-wc-primary-text"
                                        : "border-transparent text-wc-text-3 hover:text-wc-text hover:border-wc-border"
                                        }`}
                                >
                                    <IoArrowUpCircleOutline className="w-4 h-4" />
                                    App Updates
                                </Link>
                            )}


                            {desktop ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveSecurityTab?.("audit-log")
                                    }
                                    className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${isActive("audit-log", "/audit-log")
                                            ? "border-wc-primary text-wc-primary-text"
                                            : "border-transparent text-wc-text-3 hover:text-wc-text hover:border-wc-border"
                                        }`}
                                >
                                    <IoSearchCircleOutline className="w-4 h-4" />
                                    Audit Log
                                </button>
                            ) : (
                                <Link
                                    href="/dashboard/settings/account/security/audit-log"
                                    className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${isActive("audit-log", "/audit-log")
                                            ? "border-wc-primary text-wc-primary-text"
                                            : "border-transparent text-wc-text-3 hover:text-wc-text hover:border-wc-border"
                                        }`}
                                >
                                    <IoSearchCircleOutline className="w-4 h-4" />
                                    Audit Log
                                </Link>
                            )}

                        </nav>
                    </div>

                    {children}

                </div>
            </div>
        </div>
    );
}