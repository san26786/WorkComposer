"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
    open: boolean;
    app: any;
    onClose: () => void;
    onDelete: () => void;
};

export default function DeleteAppConfigurationModal({
    open,
    app,
    onClose,
    onDelete,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
                <div className="px-4 py-5 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>

                    <h2 className="text-md font-semibold text-gray-900">
                        Delete App Configuration
                    </h2>

                    <p className="mt-3 text-sm text-gray-500">
                        Are you sure you want to remove this app from your
                        tracking configuration? This action cannot be undone.
                    </p>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                    onClick={onDelete}
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Delete App
                    </button>
                </div>
            </div>
        </div>
    );
}