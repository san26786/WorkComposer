"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import axios from "axios";
import toast from "react-hot-toast";

export type Subscription = {
    plan: string;
    billingCycle: string;
    status: string;
};

export type BillingProfile = {
    companyName: string;
    contactName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
};

export type PaymentMethod = {
    brand: string;
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
};

export function useBillingOverview() {
    const [loading, setLoading] = useState(true);

    const [subscription, setSubscription] =
        useState<Subscription | null>(null);

    const [billingProfile, setBillingProfile] =
        useState<BillingProfile | null>(null);

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod | null>(null);

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/billing/overview");

            setSubscription(data.subscription);
            setBillingProfile(data.billingProfile);
            setPaymentMethod(data.paymentMethod);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ??
                    "Failed to load billing overview."
                );
            } else {
                toast.error("Failed to load billing overview.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    return {
        loading,
        subscription,
        billingProfile,
        paymentMethod,
        fetchOverview,
    };
}