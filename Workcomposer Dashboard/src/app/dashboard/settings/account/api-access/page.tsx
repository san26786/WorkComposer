"use client";

import { useState } from "react";
import { Code2, FileText, BookOpen } from "lucide-react";
import ApiKeys from "./components/ApiKeys";
import ApiLogs from "./components/ApiLogs";

type Tab = "keys" | "logs" | "docs";

export default function ApiAccessPage() {
    const [activeTab, setActiveTab] = useState<Tab>("keys");

    return (
        <div className="w-full p-6">
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("keys")}
                    className={`flex items-center gap-2 pb-4 text-[14px] font-medium transition ${activeTab === "keys"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-black"
                        }`}
                >
                    <Code2 size={16} />
                    API Keys
                </button>

                <button
                    onClick={() => setActiveTab("logs")}
                    className={`flex items-center gap-2 pb-4 text-[14px] font-medium transition ${activeTab === "logs"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-black"
                        }`}
                >
                    <FileText size={16} />
                    API Logs
                </button>

                <button
                    onClick={() => setActiveTab("docs")}
                    className={`flex items-center gap-2 pb-4 text-[14px] font-medium transition ${activeTab === "docs"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-black"
                        }`}
                >
                    <BookOpen size={16} />
                    API Documentation
                </button>
            </div>

            {/* Card */}
            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
                {activeTab === "keys" && <ApiKeys />}

                {activeTab === "logs" && <ApiLogs />}

                {activeTab === "docs" && (
                    <div className="py-20 text-center text-gray-500 text-lg">
                        API Documentation Page
                    </div>
                )}
            </div>
        </div>
    );
}
