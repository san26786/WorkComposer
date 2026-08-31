"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/api";
import toast from "react-hot-toast";

export default function VerifyEmailChangePage() {

    const params = useParams();

    const token = params?.token as string;

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const verifyEmail = async () => {

            try {
                const res = await API.get(
                    `/users/verify-email-change/${token}`
                );

                setSuccess(true);

                toast.success(
                    res.data.message || "Email updated successfully"
                );

            } catch (err: any) {

                setSuccess(false);

                toast.error(
                    err?.response?.data?.message ||
                    "Invalid or expired verification link"
                );

            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyEmail();
        }

    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

            <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8 text-center">

                {loading ? (

                    <>
                        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

                        <h2 className="mt-6 text-xl font-semibold text-gray-900">
                            Verifying Email...
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Please wait while we verify your email change request.
                        </p>
                    </>

                ) : success ? (

                    <>
                        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100">

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-gray-900">
                            Email Verified
                        </h2>

                        <p className="mt-3 text-sm text-gray-600">
                            {message}
                        </p>
                    </>

                ) : (

                    <>
                        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100">

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-gray-900">
                            Verification Failed
                        </h2>

                        <p className="mt-3 text-sm text-gray-600">
                            {message}
                        </p>
                    </>

                )}

            </div>
        </div>
    );
}