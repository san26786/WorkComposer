"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import axios from "axios";

type Subscription = {
    _id: string;
    organization: string;

    plan: "standard" | "premium" | "enterprise";
    billingCycle: "monthly" | "annual";

    quantity: number;

    status: string;

    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;

    startsAt?: string;
    createdAt: string;
    updatedAt: string;
};

export function useSubscription() {
    const [loading, setLoading] = useState(true);

    const [subscription, setSubscription] =
        useState<Subscription | null>(null);

    const fetchSubscription = useCallback(async () => {
        try {
            setLoading(true);

            const { data } =
                await API.get("/billing/subscription");

            setSubscription(data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ??
                    "Failed to load subscription."
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    return {
        loading,
        subscription,
        fetchSubscription,
    };
}