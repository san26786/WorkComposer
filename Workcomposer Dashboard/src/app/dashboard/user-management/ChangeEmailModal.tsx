"use client";

import { MdEmail } from "react-icons/md";
import { X } from 'lucide-react';
import type React from "react";
import { useState } from "react";
import API from "@/api";

interface ChangeEmailModalProps {
    user: any;
    setShowChangeEmailModal: React.Dispatch<React.SetStateAction<boolean>
    >;
    setUsers: React.Dispatch<React.SetStateAction<any[]>
    >;
}

const ChangeEmailModal = ({
    user,
    setShowChangeEmailModal,
    setUsers,
}: ChangeEmailModalProps) => {

    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChangeEmail = async () => {
        try {
            setLoading(true);

            setErrorMessage("");
            setSuccessMessage("");

            if (!email.trim()) {
                setErrorMessage("Email is required");

                return;
            }
          

            const res = await API.put(`/users/${user._id || user.id}/email-request`, {
                newEmail: email,
            }
            );

            alert("verification email sent successfully")

            setShowChangeEmailModal(false);

            setSuccessMessage(res.data.message || "Verification email sent successfully");

            setTimeout(() => {
                setShowChangeEmailModal(false);
            }, 1200);
        } catch (err: any) {
            console.error(err);
            setErrorMessage(err?.response?.data?.message || "Failed to update email");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div role='dialog' className='relative z-50' aria-modal='true'>
                <div className='fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity'></div>
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
                        <div className='relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full w-full max-w-lg p-6'>

                            <div className='flex justify-between items-center'>
                                <h2 className='text-xl font-semibold text-gray-900'>Change Email</h2>
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowChangeEmailModal(false)
                                    }
                                    className='text-gray-400 hover:text-gray-500 focus:outline-none'>
                                    <X className='h-6 w-6' />
                                </button>
                            </div>

                            <div className='border-t border-gray-200 my-5'></div>
                            <div className='text-sm text-gray-700 space-y-4'>
                                <p> Enter the new email address for the user. A verification email will be sent. The user must confirm via the verification link. </p>
                                <p className='italic text-gray-500'>Note: The change is not complete until verified.</p>
                            </div>

                            {successMessage && (
                                <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                    {successMessage}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                    {errorMessage}
                                </div>
                            )}

                            <form className='mt-5'>
                                <div className='mb-4'>
                                    <label htmlFor='new-email' className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                                    <input
                                        id='new-email'
                                        type='email'
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className='block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500' placeholder='newuser@example.com'></input>
                                </div>
                            </form>

                            <div className='mt-8 flex justify-end gap-3'>
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowChangeEmailModal(false)
                                    }
                                    className='rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'>Cancel</button>
                                <button
                                    type='button'
                                    disabled={loading}
                                    onClick={handleChangeEmail}
                                    className='rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors duration-200'>
                                    <MdEmail className="h-5 w-5 mr-1.5 inline-block" />
                                    {
                                        loading ? "Sending..." : "Confirm and Send"
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChangeEmailModal
