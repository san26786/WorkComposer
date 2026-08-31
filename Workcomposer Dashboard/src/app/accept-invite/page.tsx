"use client";

import Image from 'next/image'
import logoW from "@/assets/logo.W.png";
import { CiUser } from "react-icons/ci";
import { BsLock } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import Microsoft from "@/assets/microsoft.svg";
import { FaApple } from "react-icons/fa";
import { GoArrowRight } from "react-icons/go";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import API from "@/api";

function AcceptInviteUIContent() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        password: "",
    })
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [role, setRole] = useState("");
    const [team, setTeam] = useState("");

    const searchParams = useSearchParams();

    const token = searchParams.get("token")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError("Invalid invite link");
            return;
        }

        if (!form.firstName || !form.lastName || !form.password) {
            setError("Please fill all fields");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const acceptRes = await API.post("/users/accept-invite", {
                token,
                ...form,
            });

            // Auto login
            await API.post("/auth/login", {
                email,
                password: form.password,
            });

            setMessage("Welcome to WorkComposer 🎉");

            setTimeout(() => {
                window.location.replace(
                    "/dashboard/time-tracking/overview"
                );
            }, 1000);

            setMessage("Welcome to WorkComposer🎉")
            setTimeout(() => {
                window.location.replace("/dashboard/time-tracking/overview");
            }, 1000)

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!token) return;

        API.get(`/users/invite/${token}`)
            .then((res) => {
                setEmail(res.data.email);
                setRole(res.data.role);
                setTeam(res.data.team);
            })
            .catch((err) => {
                console.error("INVITE DETAILS ERROR:", err);

                setError(
                    err.response?.data?.message ||
                    "Invalid or expired invite"
                );
            });
    }, [token]);



    return (
        <>
            <div>


                <div aria-live='assertive' className='pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-100'>
                    <div className='flex w-full flex-col items-center space-y-4 sm:items-end'>

                    </div>
                </div>
                <div className='flex min-h-full flex-1 flex-col justify-center py-8 sm:py-10 px-2 sm:px-4 lg:px-6 bg-gradient-to-b from-gray-50 to-white'>

                    {message && (
                        <div className='text-green-600 text-sm text-center mb-4'>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className='text-red-600 text-sm text-center mb-4'>
                            {error}
                        </div>
                    )}

                    <div className='sm:mx-auto sm:w-full sm:max-w-md'>
                        <div className='flex items-center justify-center space-x-4'>
                            <Image className='h-11 w-auto object-contain' src={logoW} alt="WorkComposer" />
                            <div className='flex-1'>
                                <h2 className='text-2xl font-bold leading-7 text-gray-900'>Join
                                    <b>{team}</b>
                                    account
                                </h2>
                                <p className='text-base text-gray-600 mt-0.5'>as {email ? email : "Fetching invite..."}</p>
                                <p className='text-sm text-gray-500 mt-1'>Role: {role} </p>
                            </div>
                        </div>
                    </div>

                    <div className='mt-6 sm:mx-auto sm:w-full sm:max-w-[480px]'>
                        <div className='bg-white px-6 py-8 sm:py-10 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-100 transition-all duration-300 hover:shadow-xl relative overflow-hidden'>
                            <div className='absolute top-0 left-0 right-0 h-1.5 bg-indigo-600'></div>
                            <div>
                                <div>
                                    <form onSubmit={handleSubmit} className='space-y-5 animate-fadeIn'>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                            <div>
                                                <label htmlFor="firstName" className='block text-sm font-medium leading-6 text-gray-900'>First name</label>
                                                <div className='mt-2 relative'>
                                                    <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none'>
                                                        <CiUser className='w-5 h-5 text-gray-400' />
                                                    </div>

                                                    <input id='firstName' type='text' required placeholder='Enter your first name' className='block w-full rounded-lg border-0 py-2 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200'
                                                        onChange={(e) =>
                                                            setForm({ ...form, firstName: e.target.value })
                                                        }
                                                    ></input>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="lastName" className='block text-sm font-medium leading-6 text-gray-900'>Last name</label>
                                                <div className='mt-2 relative'>
                                                    <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none'>
                                                        <CiUser className='w-5 h-5 text-gray-400' />
                                                    </div>

                                                    <input id='lastName' type='text' required placeholder='Enter your last name' className='block w-full rounded-lg border-0 py-2 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200'
                                                        onChange={(e) =>
                                                            setForm({ ...form, lastName: e.target.value })
                                                        }
                                                    ></input>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor='password' className='block text-sm font-medium leading-6 text-gray-900'>Password</label>
                                            <div className='mt-2 relative'>
                                                <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none'>
                                                    <BsLock className='w-5 h-5 text-gray-400' />
                                                </div>

                                                <input id='password' type='password' required placeholder='••••••••' className="block w-full rounded-lg border-0 py-2 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
                                                    onChange={(e) =>
                                                        setForm({ ...form, password: e.target.value })
                                                    }
                                                ></input>
                                            </div>
                                        </div>
                                        <button
                                            type='submit'
                                            disabled={loading}
                                            className='flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 disabled:opacity-70' aria-live='polite'>
                                            <span className='flex items-center justify-center gap-2'>
                                                <span>{loading ? "Creating..." : "Join"}</span>
                                            </span>
                                        </button>

                                    </form>

                                    <div className='relative mt-8'>
                                        <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                                            <div className='w-full border-t border-gray-200'></div>
                                        </div>

                                        <div className='relative flex justify-center text-sm font-medium'>
                                            <span className='bg-white px-6 text-gray-500'>Or continue with</span>
                                        </div>
                                    </div>

                                    <div className='mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn'>
                                        <a href='#' className='flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:bg-gray-100 transition-all duration-200 shadow-sm'>
                                            <FcGoogle className="w-5 h-5" aria-hidden="true" />
                                            <span>Google</span>
                                        </a>

                                        <a href='#' className='flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:bg-gray-100 transition-all duration-200 shadow-sm'>
                                            <Image src={Microsoft} alt="Microsoft" width={20} height={20} />
                                            <span>Microsoft</span>
                                        </a>

                                        <a href='#' className='flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:bg-gray-100 transition-all duration-200 shadow-sm'>
                                            <FaApple className="w-5 h-5" aria-hidden="true" />
                                            <span>Apple</span>
                                        </a>
                                    </div>

                                    <p className='mt-4 text-center text-xs text-gray-500 animate-fadeIn'>
                                        By continuing, you agree to our
                                        <a href='Terms-of-services' target='_blank' className='text-indigo-600 hover:text-indigo-500 transition-colors duration-200'>Terms of Service</a>
                                        and
                                        <a href="privacy-policy" target='_blank' className='text-indigo-600 hover:text-indigo-500 transition-colors duration-200'>Privacy Policy</a>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6 text-center animate-fadeIn'>
                            <p className='text-sm text-gray-600'>
                                <a href='signin' className='font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 inline-flex items-center group'>
                                    Return to sign in
                                    <GoArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200' />
                                </a>
                            </p>

                            <p className='mt-2 text-xs text-gray-500'> © 2026 WorkComposer. All rights reserved. </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function AcceptInviteUI() {
    return (
        <Suspense
            fallback={<div>Loading...</div>}>
            <AcceptInviteUIContent />
        </Suspense>
    )
}


