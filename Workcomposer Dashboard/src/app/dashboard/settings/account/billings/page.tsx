"use client";

import { useState } from "react";
import Overview from "./components/Overview";
import Subscription from "./components/Subscription";
import PaymentBilling from "./components/PaymentBilling";
import Invoices from "./components/Invoices";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import API from "@/api";

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState("overview");

    const searchParams = useSearchParams();

    useEffect(() => {
        const checkoutStatus =
            searchParams.get("checkout");

        const sessionId =
            searchParams.get("session_id");

        if (
            checkoutStatus !== "success" ||
            !sessionId
        ) {
            return;
        }

        const syncCheckout = async () => {
            try {
                const response = await API.post(
                    "/billing/sync-checkout-session",
                    {
                        sessionId,
                    }
                );

                // Remove checkout parameters from URL
                window.history.replaceState(
                    {},
                    "",
                    window.location.pathname
                );

            } catch (error: any) {
                console.error(
                    "STRIPE CHECKOUT SYNC ERROR:",
                    error.response?.data || error
                );
            }
        };

        syncCheckout();
    }, [searchParams]);

    return (
        <div className="space-y-6 p-10">

            <div>
                <h1 className="text-2xl font-bold">
                    Billing & Usage
                </h1>

                <p className="mt-1 text-gray-500">
                    Manage your subscription, payment methods and invoices.
                </p>
            </div>

            {/* Tabs */}

            <div className="border-b">
                <nav className="flex gap-8">

                    <button
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </button>

                    <button
                        onClick={() => setActiveTab("subscription")}
                    >
                        Subscription
                    </button>

                    <button
                        onClick={() => setActiveTab("payment")}
                    >
                        Payment & Billing
                    </button>

                    <button
                        onClick={() => setActiveTab("invoices")}
                    >
                        Invoices
                    </button>

                </nav>
            </div>

            {/* Content */}

            {activeTab === "overview" && (
                <Overview />
            )}

            {activeTab === "subscription" && (
                <Subscription />
            )}

            {activeTab === "payment" && (
                <PaymentBilling />
            )}

            {activeTab === "invoices" && (
                <Invoices />
            )}

        </div>
    );
}
