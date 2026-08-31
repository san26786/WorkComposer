"use client";

import { useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    onGenerate: (name: string) => void;
};

export default function GenerateApiKeyModal({
    open,
    onClose,
    onGenerate,
}: Props) {

    const [apiKeyName, setApiKeyName] = useState("");
    const [error, setError] = useState("");

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-semibold">
                    New API key generation
                </h2>

                <input
                    type="text"
                    placeholder="Please type API key name"
                    value={apiKeyName}
                    onChange={(e) => {
                        setApiKeyName(e.target.value);

                        if (error) {
                            setError("");
                        }
                    }}
                    className="mt-6 w-full rounded-lg border px-4 py-3 outline-none"
                />

                {error && (
                    <p className="mt-2 text-sm text-red-500">
                        {error}
                    </p>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        onClick={() => {
                            setApiKeyName("");
                            setError("");
                            onClose();
                        }}
                        className="rounded-lg border px-6 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            if (!apiKeyName.trim()) {
                                setError("API key name is required.");
                                return;
                            }

                            onGenerate(apiKeyName.trim());

                            setApiKeyName("");
                            setError("");
                            onClose();
                        }}
                        className="rounded-lg bg-blue-600 px-6 py-2 text-white"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}