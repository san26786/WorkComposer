"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import API from "@/api";
import axios from "axios";
import toast from "react-hot-toast";

type BillingProfile = {
    companyName: string;
    contactName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    taxId?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    billingProfile: BillingProfile | null;
    onUpdated: (billingProfile: BillingProfile) => void;
};

export default function EditBillingProfileModal({
    open,
    onClose,
    billingProfile,
    onUpdated,
}: Props) {
    const [formData, setFormData] = useState<BillingProfile>({
        companyName: "",
        contactName: "",
        email: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        taxId: "",
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (billingProfile) {
            setFormData({
                companyName: billingProfile.companyName || "",
                contactName: billingProfile.contactName || "",
                email: billingProfile.email || "",
                address: billingProfile.address || "",
                city: billingProfile.city || "",
                state: billingProfile.state || "",
                postalCode: billingProfile.postalCode || "",
                country: billingProfile.country || "",
                taxId: billingProfile.taxId || "",
            });
        }
    }, [billingProfile]);

    if (!open) {
        return null;
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try {
            setSaving(true);

            const { data } = await API.put(
                "/billing/billing-profile",
                formData
            );

            toast.success(
                data.message ||
                "Billing information updated successfully."
            );

            onUpdated(data.billingProfile);
            onClose();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to update billing information."
                );
            } else {
                toast.error(
                    "Failed to update billing information."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b px-6 py-5">

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Edit billing information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Update the information shown on your invoices.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>

                {/* Form */}

                <form onSubmit={handleSubmit}>

                    <div className="max-h-[65vh] overflow-y-auto px-6 py-6">

                        <div className="grid gap-5 sm:grid-cols-2">

                            {/* Company */}

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Company name
                                </label>

                                <input
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Company name"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Contact */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Contact name
                                </label>

                                <input
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    placeholder="Contact name"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Email */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Billing email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="billing@example.com"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Address */}

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Address
                                </label>

                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Street address"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* City */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    City
                                </label>

                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* State */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    State
                                </label>

                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Postal */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Postal code
                                </label>

                                <input
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    placeholder="Postal code"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Country */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Country
                                </label>

                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Country"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Tax ID */}

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Tax ID
                                </label>

                                <input
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    placeholder="Tax identification number"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                        </div>

                    </div>

                    {/* Footer */}

                    <div className="flex justify-end gap-3 border-t px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}