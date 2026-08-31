"use client";

import { useSearchParams, useRouter } from "next/navigation";
import API from "@/api";
import Image from "next/image";
import logo from "@/assets/logo.W.png";
import { GoLock } from "react-icons/go";
import { useState, Suspense } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { BsArrowRight } from "react-icons/bs";

const ResetPasswordContent = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setMessage("Passwords do not match");
    }

    try {
      const res = await API.post("/auth/reset-password", {
        token,
        password,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        router.push("/authenticate/login");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };
  return (
    <div>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-100"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end"></div>
      </div>

      <div className="flex min-h-full flex-1 flex-col justify-center py-8 sm:py-10 px-2 sm:px-4 lg:px-6 bg-linear-to-b from-gray-50 to-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center space-x-4">
            <Image className="h-11 w-auto" src={logo} alt="Workcomposer logo" />

            <div className="flex-1">
              <h2 className="text-2xl font-bold leading--7 text-gray-900">
                Reset your password
              </h2>
              <p className="text-base text-gray-600 mt-0.5">
                Enter and confirm your new password below.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-120">
          <div className="bg-white px-6 py-8 sm:py-10 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-100 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium leading-6 text-gray-900 "
                >
                  New password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <GoLock className="w-5 h-5 text-gray-400" />
                  </div>

                  <input
                    id="newPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    placeholder="Enter new password"
                    className="block w-full rounded-lg border-0 py-2 pl-12 pr-4 text-gray-400 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900 "
                >
                  Confirm new password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <HiOutlineCheckCircle className="w-5 h-5 text-gray-400" />
                  </div>

                  <input
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    placeholder="Confirm new password"
                    className="block w-full rounded-lg border-0 py-2 pl-12 pr-4 text-gray-400 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 disabled:opacity-70"
                  aria-live="polite"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Reset Password</span>
                  </span>
                </button>

                {message && (
                  <p className="text-center text-sm mt-2 text-green-600">
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 text-center animate-fadeIn">
            <p className="text-sm text-gray-600">
              Remembered your password?{" "}
              <button
                onClick={() => router.push("/authenticate/login")}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 inline-flex items-center group"
              >
                Sign in
                <BsArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </p>

            <p className="text-xs mt-2 text-gray-500">
              {" "}
              © 2026 WorkComposer. All rights reserved.{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
