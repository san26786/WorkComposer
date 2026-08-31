"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    apiKey: string;
    keyName: string;
    onClose: () => void;
};

export default function GeneratedApiKeyModal({
    open,
    apiKey,
    keyName,
    onClose,
}: Props) {

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey);

            setCopied(true);

            toast.success("API key copied to clipboard.");

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to copy API key", error);

            toast.error("Failed to copy API key.");
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl rounded-2xl bg-white p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-semibold">
                    New API key generation
                </h2>

                <p className="mt-6 text-green-600">
                    API Key generated successfully.
                </p>

                <p className="mt-4 text-lg font-medium">
                    Make sure to copy your API Key now. For security reasons, it won&#39;t be displayed again.
                </p>

                <hr className="my-8" />

                <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
                    <span className="font-semibold md:w-24">
                        {keyName}
                    </span>

                    <div className="flex flex-1 gap-3">
                        <div className="flex-1 rounded-lg border bg-gray-50 px-4 py-3">
                            <code className="break-all text-sm">
                                {apiKey}
                            </code>
                        </div>

                        <button
                            onClick={handleCopy}
                            className="rounded-lg border px-5 py-3"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-8 py-3 text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}