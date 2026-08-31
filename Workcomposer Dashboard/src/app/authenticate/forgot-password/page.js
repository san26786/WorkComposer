"use client";

import { useState } from "react";
import API from "@/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/logo.W.png";
import { TbMail } from "react-icons/tb";
import { BsArrowRight } from "react-icons/bs";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px py-6 sm:items-start sm:p-6 z-100"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end"></div>
      </div>

      <div className="flex min-h-full flex-1 flex-col justify-center py-8 sm:py-10 px-2 sm:px-4 lg:px-6 bg-linear-to-b from-gray-50 to-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center space-x-4">
            <Image className="h-11 w-auto" src={logo} alt="Workcomposer logo" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900">
                Forgot your password?
              </h2>
              <p className="text-base text-gray-600 mt-0.5">
                Enter your email and we'll send you a reset link.
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
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>

                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <TbMail className="w-5 h-5 text-gray-400" />
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    id="email"
                    autoComplete="email"
                    required
                    placeholder="your.email@example.com"
                    aria-describedby="email-description"
                    className="block w-full rounded-lg border-0 py-2 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
                  />

                  <div id="email-description" className="sr-only">
                    Enter your email address to receive a password reset link
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 disabled:opacity-70"
                  aria-live="polite"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Send reset link</span>
                  </span>
                </button>

                {message && (
                  <p className="text-center text-sm text-green-600 mt-2">
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 text-center animate-fadeIn">
            <p className="text-sm text0gray-600">
              Remembered your password?
              <button
                onClick={() => router.push("/authenticate/login")}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 inline-flex items-center group"
              >
                Sign in
                <BsArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {" "}
              © 2026 WorkComposer. All rights reserved.{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
