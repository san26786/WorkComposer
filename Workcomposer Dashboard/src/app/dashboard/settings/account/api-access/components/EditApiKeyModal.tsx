"use client";

import { useEffect, useState } from "react";

type Props = {
    open: boolean;
    initialName: string;
    onClose: () => void;
    onSave: (name: string) => void;
};

export default function EditApiKeyModal({
    open,
    initialName,
    onClose,
    onSave,
}: Props) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) {
            setName(initialName);
        }
    }, [open, initialName]);

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
                    Edit API Key
                </h2>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-6 w-full rounded-lg border px-4 py-3 outline-none"
                />

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-6 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSave(name)}
                        className="rounded-lg bg-blue-600 px-6 py-2 text-white"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}