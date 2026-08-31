"use client";
import { useEffect, useState } from "react";
import API from "@/api";
import { Check } from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";
import toast from "react-hot-toast";

export default function Subscription() {

    const {
        loading,
        subscription,
        fetchSubscription,
    } = useSubscription();

    const [billingCycle, setBillingCycle] =
        useState<"monthly" | "annual">(
            subscription?.billingCycle === "annual"
                ? "annual"
                : "monthly"
        );

    useEffect(() => {
        if (
            subscription?.billingCycle === "monthly" ||
            subscription?.billingCycle === "annual"
        ) {
            setBillingCycle(subscription.billingCycle);
        }
    }, [subscription]);

    const currentPlan =
        subscription?.plan?.toLowerCase() || "standard";

    const [checkoutLoading, setCheckoutLoading] =
        useState(false);


    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />

                <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />

                <div className="grid gap-6 lg:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-[520px] animate-pulse rounded-2xl bg-gray-200"
                        />
                    ))}
                </div>
            </div>
        );
    }

    const handleUpgrade = async () => {
        try {
            setCheckoutLoading(true);

            const response = await API.post(
                "/billing/create-checkout-session",
                {
                    plan: "premium",
                    billingCycle,
                }
            );

            const checkoutUrl =
                response.data?.checkoutUrl;

            if (!checkoutUrl) {
                throw new Error(
                    "Stripe Checkout URL was not returned."
                );
            }

            window.location.href = checkoutUrl;
        } catch (error: any) {
            console.error(
                "STRIPE CHECKOUT ERROR:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to start checkout."
            );

            setCheckoutLoading(false);
        }
    };

    const handleDowngrade = async () => {
        try {
            setCheckoutLoading(true);

            const response = await API.post(
                "/billing/change-plan",
                {
                    plan: "standard",
                    billingCycle,
                }
            );

            // Refresh subscription from backend
            await fetchSubscription();

            toast.success("Subscription plan changed successfully.");

        } catch (error: any) {
            console.error(
                "STRIPE PLAN CHANGE ERROR:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to change subscription plan."
            );

        } finally {
            setCheckoutLoading(false);
        }
    };

    const plans = [
        {
            id: "standard",
            name: "Standard",
            description: "Everything you need to manage your team and projects.",
            monthly: 999,
            annual: 749,
            features: [
                "Automatic time tracking",
                "Screenshot monitoring",
                "Web and app usage",
                "Project time tracking",
                "Shift scheduling",
            ],
        },
        {
            id: "premium",
            name: "Premium",
            description: "Advanced productivity insights and automation.",
            monthly: 1999,
            annual: 1499,
            features: [
                "Screenshot blurring",
                "Extended Silent Mode",
                "External storage (S3, SFTP)",
                "Custom reports",
                "Priority support",
            ],
        },
        {
            id: "enterprise",
            name: "Enterprise",
            description: "Custom solution for large organizations.",
            monthly: null,
            annual: null,
            features: [
                "Customizable solutions",
                "Volume discounts",
            ],
        },
    ];

    const standardPlan = plans[0]!;
    const premiumPlan = plans[1]!;
    const enterprisePlan = plans[2]!;

    return (
        <div className="space-y-8">

            <div className="rounded-2xl border border-gray-200 bg-white p-6">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                            YOUR PLAN
                        </p>

                        <h2 className="mt-1 text-md font-bold capitalize">
                            {subscription?.plan} · {billingCycle}
                        </h2>

                        <p className="text-sm text-gray-500">
                            Renews each month, billed in arrears.
                        </p>

                    </div>

                    <div className="flex flex-col items-start lg:items-end">

                        <div className="flex rounded-2xl border border-gray-200 p-1">

                            <button
                                onClick={() => setBillingCycle("monthly")}
                                className={`rounded-2xl px-3 py-1 text-sm font-medium transition ${billingCycle === "monthly"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "text-gray-700"
                                    }`}
                            >
                                Monthly
                            </button>

                            <button
                                onClick={() => setBillingCycle("annual")}
                                className={`rounded-2xl px-3 py-1 text-sm font-medium transition ${billingCycle === "annual"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "text-gray-700"
                                    }`}
                            >
                                Annual
                            </button>

                        </div>

                        <div className="inline-flex mt-2 text-sm">
                            <p className="text-green-600">
                                Save up to 25% {" "}
                            </p>
                            <p>with annual billing</p>
                        </div>

                    </div>

                </div>

            </div>

            <div className="grid gap-6 xl:grid-cols-3">

                {/* Standard Card */}

                <div
                    className={`relative flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ${currentPlan === "standard"
                        ? "border-2 border-blue-600"
                        : "border border-gray-200"
                        }`}
                >

                    {currentPlan === "standard" && (
                        <div className="absolute -top-3 left-8 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                            Current Plan
                        </div>
                    )}

                    <h3 className="mt-3 text-lg text-indigo-500 font-bold">
                        Standard
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Everything you need to get started.
                    </p>

                    <div className="mt-5">

                        <span className="text-3xl font-extrabold">
                            ₹
                            {billingCycle === "monthly"
                                ? standardPlan.monthly
                                : standardPlan.annual}
                        </span>

                        <span className="ml-2 text-gray-700 font-semibold">
                            / user / month
                        </span>

                    </div>
                    <button
                        onClick={
                            currentPlan === "premium"
                                ? handleDowngrade
                                : undefined
                        }
                        disabled={
                            currentPlan === "standard" ||
                            checkoutLoading
                        }
                        className={`mt-8 w-full rounded-lg py-1.5 font-semibold transition ${currentPlan === "standard"
                            ? "cursor-not-allowed bg-gray-100 text-gray-700"
                            : "bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            }`}
                    >
                        {currentPlan === "standard"
                            ? "Your Current Plan"
                            : checkoutLoading
                                ? "Changing Plan..."
                                : "Downgrade Plan"}
                    </button>

                    <div className="mt-6 space-y-3">

                        {standardPlan.features.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3"
                            >
                                <Check className="h-5 w-5 text-blue-600" />

                                <span className="text-sm text-gray-700">
                                    {feature}
                                </span>
                            </div>
                        ))}

                    </div>

                </div>

                {/* Premium */}

                <div
                    className={`flex h-full flex-col rounded-3xl bg-white p-8 transition-all duration-200 ${currentPlan === "premium"
                        ? "border-2 border-blue-600"
                        : "border border-gray-200 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400"
                        }`}
                >

                    <h3 className="text-lg text-indigo-500 font-bold">
                        Premium
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Advanced tools and customization.
                    </p>

                    <div className="mt-5">

                        <span className="text-3xl font-extrabold">
                            ₹
                            {billingCycle === "monthly"
                                ? premiumPlan.monthly
                                : premiumPlan.annual}
                        </span>

                        <span className="ml-2 text-gray-700 font-semibold">
                            / user / month
                        </span>

                    </div>

                    <button
                        onClick={
                            currentPlan === "premium"
                                ? undefined
                                : handleUpgrade
                        }
                        disabled={
                            checkoutLoading ||
                            currentPlan === "premium"
                        }
                        className={`mt-8 w-full rounded-lg py-1.5 font-semibold transition ${currentPlan === "premium"
                            ? "cursor-not-allowed bg-gray-100 text-gray-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {currentPlan === "premium"
                            ? "Your Current Plan"
                            : checkoutLoading
                                ? "Opening Checkout..."
                                : "Upgrade Plan"}
                    </button>

                    <div className="mt-6 space-y-3">

                        {premiumPlan.features.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3"
                            >
                                <Check className="h-5 w-5 text-blue-600" />

                                <span className="text-sm text-gray-700">
                                    {feature}
                                </span>
                            </div>
                        ))}

                    </div>

                </div>

                {/* Enterprise */}

                <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400">

                    <h3 className="text-lg text-indigo-500 font-bold">
                        {enterprisePlan.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {enterprisePlan.description}
                    </p>

                    <div className="mt-5">

                        <span className="text-3xl font-extrabold">
                            Custom
                        </span>
                    </div>

                    <button
                        className="mt-8 w-full rounded-xl bg-blue-600 py-1.5 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Contact Sales
                    </button>

                    <div className="mt-6 space-y-3">

                        {enterprisePlan.features.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3"
                            >
                                <Check className="h-5 w-5 text-blue-600" />

                                <span className="text-sm text-gray-700">
                                    {feature}
                                </span>
                            </div>
                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
}