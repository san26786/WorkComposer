"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import API from "@/api";
import Image from "next/image";

import logo from "@/assets/logo.W.png";
import mailVerify from "@/assets/email-verify.png";
import { ArrowRight } from "lucide-react";

const MailVerifyContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const handleResend = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/resend-verification", { email });

      setMessage(res.data.message || "Verification email sent again!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-100"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end"></div>
      </div>
      <div className="flex min-h-full flex-col justify-center py-8 sm:py-10 px-2 sm:px-4 lg:px-6 bg-linear-to-b from-gray-50 to-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center space-x-4">
            <Image src={logo} alt="WorkComposer" width={120} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900">
                Verify Your Account
              </h2>
              <p className="text-base text-gray-600 mt-0.5">
                Check your email & click the link to activate your account.
              </p>

              {email && (
                <p className="text-sm mt-2">
                  Sent to: <strong>{email}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-120">
          <div className="bg-white px-6 py-8 sm:py-10 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-100 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

            <div className="my-4 animate-fadeIn">
              <Image src={mailVerify} alt="Mail-verify" width={150} />
            </div>

            {message && (
              <div className="text-center text-sm text-green-600 mb-3">
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn">
              <button
                onClick={handleResend}
                disabled={loading}
                className="cursor-pointer inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg transition-all duration-200 hover:translate-y-px disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "Sending..." : "Resend Email"}
              </button>
              <a
                href="#"
                className="inline-flex justify-center rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all duration-200"
              >
                Contact Support
              </a>
            </div>
          </div>

          <div className="mt-6 text-center animate-fadeIn">
            <p className="text-sm text-gray-600">
              <button
                onClick={() => router.push("/authenticate/login")}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 inline-flex items-center group"
              >
                Return to sign in
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {" "}
              © 2026 WorkComposer. All rights reserved.{" "}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default function MailVerify() {
  return(
    <Suspense
    fallback={<div>Loading...</div>}>
    <MailVerifyContent />
    </Suspense>
  )
}
