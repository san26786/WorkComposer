"use client";

import { XCircle, MessageSquareWarning, TriangleAlert } from "lucide-react";
import { useState } from "react";
import API from "@/api";

type Props = {
    open: boolean;
    request?: any;
    requests?: string[];
    onClose: () => void;
    onSuccess: () => void;
};

export default function RejectRequestModal({
    open,
    request,
    requests = [],
    onClose,
    onSuccess,
}: Props) {

    const [comment, setComment] = useState("");

    const handleReject = async () => {
        try {

            if (requests.length > 0) {

                await Promise.all(
                    requests.map((id) =>
                        API.patch(
                            `/manual-time-requests/${id}/reject`,
                            {
                                comment,
                            }
                        )
                    )
                );

            } else if (request) {

                await API.patch(
                    `/manual-time-requests/${request._id}/reject`,
                    {
                        comment,
                    }
                );

            }

            setComment("");

            onSuccess();

            window.dispatchEvent(
                new Event("refreshInboxCount")
            );

            onClose();

        } catch (err) {
            console.error(err);
        }
    };

    if (!open) return null;

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                <div className="w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto overflow-hidden rounded-2xl bg-white shadow-2xl">

                    {/* Header */}

                    <div className="bg-red-50 border-b border-red-100 px-4 sm:px-8 py-5 sm:py-7">

                        <div className="flex items-center">

                            <div className="mr-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 shadow-lg">

                                <XCircle className="h-7 w-7 text-white" />

                            </div>

                            <div>

                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                    Add Rejection Note
                                </h2>

                                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                    Provide a reason for rejecting this time request
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Body */}

                    <div className="space-y-6 p-4 sm:p-8">

                        <div>

                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">

                                <MessageSquareWarning className="h-4 w-4 text-red-600" />

                                Rejection Reason

                            </label>

                            <textarea
                                rows={5}
                                style={{ resize: "vertical" }}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Please provide a clear reason..."
                                className="w-full rounded-xl border-2 border-red-200 px-4 py-3 outline-none transition focus:border-red-500"
                            />

                        </div>

                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">

                            <div className="flex gap-3">

                                <TriangleAlert className="mt-1 h-5 w-5 text-orange-600" />

                                <div>

                                    <h3 className="font-semibold text-orange-700">
                                        Important Note
                                    </h3>

                                    <p className="mt-1 text-sm text-orange-600">
                                        The employee will receive your rejection
                                        reason. Please keep it clear,
                                        professional and constructive.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Footer */}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 border-t bg-gray-50 px-4 sm:px-8 py-4 sm:py-5">

                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold shadow-sm hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleReject}
                            className="w-full sm:w-auto rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow hover:bg-red-700"
                        >
                            {requests.length > 0
                                ? `Reject ${requests.length} Requests`
                                : "Reject Request"}
                        </button>

                    </div>

                </div>

            </div>

        </>
    );
}