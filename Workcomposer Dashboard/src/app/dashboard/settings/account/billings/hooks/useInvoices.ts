"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import axios from "axios";
import toast from "react-hot-toast";

export type Invoice = {
    _id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    issuedAt: string;
    paidAt?: string;
    pdfUrl?: string;
};

export function useInvoices() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/billing/invoices");

            setInvoices(data.invoices);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ??
                    "Failed to fetch invoices."
                );
            } else {
                toast.error("Failed to fetch invoices.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return {
        loading,
        invoices,
        fetchInvoices,
    };
}