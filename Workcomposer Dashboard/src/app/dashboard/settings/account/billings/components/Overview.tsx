"use client";

import { useBillingOverview } from "../hooks/useBillingOverview";
import {
    CreditCard,
    Building2,
    BadgeCheck,
    AlertTriangle,
} from "lucide-react";

export default function Overview() {
    const {
        loading,
        subscription,
        billingProfile,
        paymentMethod,
    } = useBillingOverview();

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-72 animate-pulse rounded-2xl bg-gray-200"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-gray-50 min-h-screen p-6">

            {!paymentMethod?.last4 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-md font-semibold text-red-900">
                                Payment Method Required
                            </h3>

                            <p className="mt-0.5 text-sm text-red-700">
                                Add a payment method to keep your subscription active and enable automatic renewals.
                            </p>
                        </div>

                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-bold text-gray-900">
                                Current Plan
                            </h3>
                        </div>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 capitalize">
                            {subscription?.status ?? "Unknown"}
                        </span>
                    </div>

                    <div className="mt-6 flex-1 space-y-6">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Plan
                            </p>

                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize">
                                {subscription?.plan}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Billing Cycle
                            </p>


                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize">
                                {subscription?.billingCycle}
                            </span>
                        </div>

                    </div>

                    <button
                        className="mt-6 w-full bg-indigo-700 text-white rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
                    >
                        Manage Subscription
                    </button>
                </div>

                <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-gray-900">
                                Payment Method
                            </h3>
                        </div>
                    </div>

                    {paymentMethod?.last4 ? (
                        <div className="mt-6 flex-1 space-y-6">

                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                    Card
                                </p>

                                <p className="mt-1 font-medium capitalize">
                                    {paymentMethod.brand} •••• {paymentMethod.last4}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                    Expires
                                </p>

                                <p className="mt-1">
                                    {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                                </p>
                            </div>

                            <button
                                className="mt-4 w-full rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                            >
                                Update Payment Method
                            </button>

                        </div>
                    ) : (
                        <div className="mt-6">

                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                No payment method has been added yet.
                            </p>

                            <button
                                className="mt-6 w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Add Payment Method
                            </button>

                        </div>
                    )}
                </div>

                <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-600" />
                            <h3 className="text-lg font-bold text-gray-900">
                                Billing Details
                            </h3>
                        </div>
                    </div>

                    <div className="mt-6 flex-1 space-y-6">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Company
                            </p>

                            <p className="text-gray-400 italic">
                                {billingProfile?.companyName || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Billing Email
                            </p>

                            <p className="text-gray-400 italic">
                                {billingProfile?.email || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Address
                            </p>

                            <p className="text-gray-400 italic">
                                {billingProfile?.address || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Country
                            </p>

                            <p className="text-gray-400 italic">
                                {billingProfile?.country || "Not provided"}
                            </p>
                        </div>

                    </div>

                    <button
                        className="mt-6 w-full rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                    >
                        Edit Billing Details
                    </button>
                </div>

            </div>

        </div >
    );
}