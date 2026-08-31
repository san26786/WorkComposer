"use client";

import { useState } from "react";
import { Pencil, Plus, CreditCard } from "lucide-react";
import { useBillingOverview } from "../hooks/useBillingOverview";
import EditBillingProfileModal from "./EditBillingProfileModal";

export default function PaymentBilling() {
    const {
        loading,
        billingProfile,
        paymentMethod,
        fetchOverview,
    } = useBillingOverview();

    const [editBillingOpen, setEditBillingOpen] = useState(false);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <div className="h-72 animate-pulse rounded-3xl bg-gray-200 xl:col-span-3" />
                <div className="h-72 animate-pulse rounded-3xl bg-gray-200 xl:col-span-2" />
            </div>
        );
    }

    return (
        <div className="grid gap-8 xl:grid-cols-5">

            {/* Billing */}

            <div className="flex min-h-[340px] flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm lg:col-span-3">

                <div className="flex items-start justify-between">

                    <div>

                        <h2 className="text-3xl font-semibold">
                            Billing information
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Shown on your invoices and tax receipts.
                        </p>

                    </div>

                    <button
                        onClick={() => setEditBillingOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >

                        <Pencil className="h-4 w-4" />

                        Edit

                    </button>

                </div>

                <div className="mt-12 space-y-3">

                    <p className="text-xl font-semibold">
                        {billingProfile?.companyName || "Company Name"}
                    </p>

                    <p className="text-gray-600">
                        {billingProfile?.address || "Address"}
                    </p>

                    <p className="text-gray-600">
                        {billingProfile?.city}
                        {billingProfile?.city && ", "}
                        {billingProfile?.state}
                        {billingProfile?.postalCode && `, ${billingProfile.postalCode}`}
                        {billingProfile?.country && `, ${billingProfile.country}`}
                    </p>

                    <p className="text-gray-600">
                        {billingProfile?.contactName}
                        {billingProfile?.contactName && " · "}
                        {billingProfile?.email}
                    </p>

                </div>

            </div>

            {/* Payment */}

            <div className="flex min-h-[340px] flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm lg:col-span-2">

                <div>

                    <h2 className="text-3xl font-semibold">
                        Payment methods
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Cards we can charge automatically for your subscription.
                    </p>

                </div>

                <div className="flex h-full flex-col items-center justify-center pt-20">

                    {paymentMethod?.last4 ? (

                        <>
                            <div className="rounded-2xl border border-gray-200 p-5 w-full">

                                <p className="font-semibold capitalize">
                                    {paymentMethod.brand}
                                </p>

                                <p className="mt-2 text-gray-600">
                                    •••• •••• •••• {paymentMethod.last4}
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                                </p>

                            </div>

                        </>

                    ) : (

                        <>

                            <div className="mb-6 rounded-full bg-blue-50 p-5">

                                <CreditCard className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="mb-8 text-center text-lg text-gray-500">
                                No Debit/Credit Cards attached to your account yet.
                            </p>

                            <button className="flex items-center gap-2 rounded-xl border border-blue-600 px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50">

                                <Plus className="h-5 w-5" />

                                Add Debit/Credit Card

                            </button>

                        </>

                    )}

                </div>

            </div>

            <EditBillingProfileModal
                open={editBillingOpen}
                onClose={() => setEditBillingOpen(false)}
                billingProfile={billingProfile}
                onUpdated={() => {
                    fetchOverview();
                }}
            />

        </div>
    );
}