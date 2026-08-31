"use client";

import { useInvoices } from "../hooks/useInvoices";
import { FileText, Download } from "lucide-react";

export default function Invoices() {
    const {
        loading,
        invoices,
    } = useInvoices();

    if (loading) {
        return (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
                Loading invoices...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-xl font-bold">
                    Invoices
                </h2>

                <p className="text-gray-500">
                    View and download your billing history.
                </p>
            </div>

            {invoices.length === 0 ? (

                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex min-h-[180px] flex-col items-center justify-center px-6 py-12">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <FileText
                                className="h-5 w-5 text-gray-500"
                                strokeWidth={1.8}
                            />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-gray-900">
                            No invoices yet
                        </h3>

                        <p className="max-w-sm text-center text-sm text-gray-500">
                            Your invoices will appear here once they're issued.
                        </p>

                    </div>

                </div>

            ) : (

                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead className="border-b border-gray-200 bg-gray-50">

                                <tr>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Invoice
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Billing period
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Issued
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Amount
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {invoices.map((invoice) => (

                                    <tr
                                        key={invoice._id}
                                        className="transition hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                </div>

                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {invoice.invoiceNumber}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {invoice.currency}
                                                    </p>
                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-5 text-sm text-gray-600">

                                            {invoice.billingPeriodStart &&
                                            invoice.billingPeriodEnd ? (
                                                <>
                                                    {formatDate(invoice.billingPeriodStart)}
                                                    {" – "}
                                                    {formatDate(invoice.billingPeriodEnd)}
                                                </>
                                            ) : (
                                                "—"
                                            )}

                                        </td>

                                        <td className="px-6 py-5 text-sm text-gray-600">
                                            {formatDate(invoice.issuedAt)}
                                        </td>

                                        <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                                            {formatAmount(
                                                invoice.amount,
                                                invoice.currency
                                            )}
                                        </td>

                                        <td className="px-6 py-5">

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                                    invoice.status
                                                )}`}
                                            >
                                                {invoice.status}
                                            </span>

                                        </td>

                                        <td className="px-6 py-5 text-right">

                                            {invoice.pdfUrl ? (

                                                <a
                                                    href={invoice.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </a>

                                            ) : (

                                                <span className="text-sm text-gray-400">
                                                    —
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}

function formatDate(date: string) {
    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "INR",
        minimumFractionDigits: 2,
    }).format(amount);
}

function getStatusClasses(status: string) {
    switch (status?.toLowerCase()) {
        case "paid":
            return "bg-green-100 text-green-700";

        case "pending":
            return "bg-yellow-100 text-yellow-700";

        case "failed":
            return "bg-red-100 text-red-700";

        case "refunded":
            return "bg-purple-100 text-purple-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
}