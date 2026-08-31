"use client"

import { HiMiniPencilSquare } from "react-icons/hi2";
import { TIMEZONES } from "@/constants/timezones";
import { ChevronsUpDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import API from "@/api";
import toast from "react-hot-toast";
import DeleteOrganizationPage from "./components/DeleteOrganizationPage";
import SettingsLoading from "@/components/settings/SettingsLoading";


const OrganizationPage = () => {

    const [organization, setOrganization] = useState({
        name: "",
        timezone: "Asia/Kolkata",
        logo: "",
    });

    const [timezones, setTimezones] = useState<string[]>([]);
    const [timezoneDropdownOpen, setTimezoneDropdownOpen] = useState(false);
    const [timezoneSearch, setTimezoneSearch] = useState("");
    const [showDeletePage, setShowDeletePage] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const timezoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                setLoading(true);

                const { data } = await API.get("/organization");

                setOrganization({
                    name: data.name || "",
                    timezone: data.timezone || "Asia/Kolkata",
                    logo: data.logo || "",
                });

                setTimezoneSearch(data.timezone || "Asia/Kolkata");
            } catch (err: any) {
                console.error("ORGANIZATION FETCH ERROR:", err);

                toast.error(
                    err.response?.data?.message ||
                    "Failed to load organization."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, []);


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);

            await API.put("/organization", {
                name: organization.name,
                timezone: organization.timezone,
            });

            toast.success("Organization updated successfully.");
        } catch (err: any) {
            console.error("ORGANIZATION UPDATE ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to update organization."
            );
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                timezoneRef.current &&
                !timezoneRef.current.contains(e.target as Node)
            ) {
                setTimezoneDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    const filteredTimezones = TIMEZONES.filter((timezone) =>
        timezone
            .toLowerCase()
            .includes(timezoneSearch.trim().toLowerCase())
    );


    if (showDeletePage) {
        return (
            <DeleteOrganizationPage
                onBack={() => setShowDeletePage(false)}
            />
        );
    }

    if (loading) {
        return (
            <div className="py-10 flex-1">
                <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                    <SettingsLoading />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="py-10 flex-1">
                <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                    <div className="min-h-[calc(100vh-250px)] px-2 sm:px-4 my-2 py-4 rounded-lg bg-wc-surface-2 shadow-sm">
                        <div>
                            <h3 className="text-lg font-semibold text-wc-text mb-6">Organization Profile</h3>
                            <div className="text-center mb-2">
                                <div className="relative inline-flex h-[80px] w-[200px] items-center justify-center overflow-hidden rounded-lg bg-wc-surface-3 border border-gray-200">

                                    {organization.logo ? (
                                        <Image
                                            src={organization.logo}
                                            alt="Organization Logo"
                                            fill
                                            unoptimized
                                            className="object-contain p-2"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl font-bold text-indigo-600">
                                            {organization.name
                                                ?.split(" ")
                                                .map((word) => word[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>
                                    )}

                                </div>
                                <div className="mt-2 space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="inline-flex items-center cursor-pointer text-sm font-medium text-wc-primary-text hover:text-wc-primary"
                                    >
                                        <HiMiniPencilSquare className="w-4 h-4 mr-1" />
                                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                                    </button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];

                                        if (!file) return;

                                        const allowedTypes = [
                                            "image/png",
                                            "image/jpeg",
                                            "image/jpg",
                                            "image/webp",
                                        ];

                                        const allowedExtensions = /\.(png|jpg|jpeg|webp)$/i;

                                        if (
                                            !allowedTypes.includes(file.type) ||
                                            !allowedExtensions.test(file.name)
                                        ) {
                                            toast.error("Please upload a PNG, JPG, JPEG or WEBP image.");
                                            return;
                                        }

                                        if (file.size > 2 * 1024 * 1024) {
                                            toast.error("Logo must be less than 2 MB.");
                                            return;
                                        }

                                        const formData = new FormData();
                                        formData.append("logo", file);

                                        try {
                                            setUploadingLogo(true);

                                            const { data } = await API.post(
                                                "/organization/upload-logo",
                                                formData,
                                                {
                                                    headers: {
                                                        "Content-Type": "multipart/form-data",
                                                    },
                                                }
                                            );

                                            setOrganization((prev) => ({
                                                ...prev,
                                                logo: data.logo,
                                            }));

                                            toast.success("Logo uploaded successfully.");
                                        } catch (err) {

                                            toast.error("Failed to upload logo.");
                                        } finally {
                                            setUploadingLogo(false);

                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }
                                    }}
                                />


                            </div>
                            <p className="text-xs text-wc-text-3 mt-2 text-center">* You may need to reopen the desktop app to see logo changes</p>
                        </div>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden='true'>
                                <div className="w-full border-t border-wc-border"></div>
                            </div>
                            <div className="relative flex justify-center"></div>
                        </div>

                        <form
                            onSubmit={handleSave}
                            className="space-y-6 max-w-xl mx-auto"
                        >
                            <div>
                                <label className="block text-sm font-medium text-wc-text">Organization Name</label>
                                <input
                                    type="text"
                                    value={organization.name}
                                    onChange={(e) =>
                                        setOrganization({
                                            ...organization,
                                            name: e.target.value,
                                        })
                                    }
                                    className="block w-full rounded-md bg-wc-surface-2 px-3 py-1.5 text-base text-wc-text outline outline-1 outline-wc-border focus:outline-wc-primary"
                                />
                            </div>
                            <div>
                                <div>
                                    <label className="block text-sm font-medium text-wc-text">Timezone</label>
                                    <div ref={timezoneRef} className="relative mt-2">

                                        <input
                                            type="text"
                                            value={timezoneSearch}
                                            onFocus={() => setTimezoneDropdownOpen(true)}
                                            onChange={(e) => {
                                                setTimezoneSearch(e.target.value);
                                                setTimezoneDropdownOpen(true);
                                            }}
                                            className="block w-full rounded-md bg-wc-surface-2 py-1.5 pr-12 pl-3 text-base text-wc-text outline outline-1 outline-wc-border focus:outline-wc-primary"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setTimezoneDropdownOpen((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 flex items-center px-2"
                                        >
                                            <ChevronsUpDown className="w-5 h-5 text-wc-text-3" />
                                        </button>

                                        {timezoneDropdownOpen && (
                                            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-xl">

                                                <div className="max-h-64 overflow-y-auto">

                                                    {filteredTimezones.length === 0 ? (

                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                            No timezone found
                                                        </div>

                                                    ) : (

                                                        filteredTimezones.map((timezone) => (
                                                            <button
                                                                key={timezone}
                                                                type="button"
                                                                onClick={() => {
                                                                    setOrganization((prev) => ({
                                                                        ...prev,
                                                                        timezone,
                                                                    }));

                                                                    setTimezoneSearch(timezone);

                                                                    setTimezoneDropdownOpen(false);
                                                                }}
                                                                className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-indigo-50 ${organization.timezone === timezone
                                                                    ? "bg-indigo-50"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                <span className="truncate">
                                                                    {timezone}
                                                                </span>

                                                                {organization.timezone === timezone && (
                                                                    <Check className="w-4 h-4 text-indigo-600" />
                                                                )}
                                                            </button>
                                                        ))

                                                    )}

                                                </div>

                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"> {saving ? "Saving..." : "Save"}</button>
                            </div>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden='true'>
                                <div className="w-full border-t border-wc-border"></div>
                            </div>
                            <div className="relative flex justify-center"></div>
                        </div>
                        <div className="mt-10 max-w-6xl mx-auto">
                            <h4 className="text-base font-semibold text-red-600 mb-3">
                                Delete Account
                            </h4>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-md border border-wc-danger bg-red-100 px-5 py-4">

                                <p className="text-sm text-red-700 leading-6">
                                    <strong>Warning: </strong>
                                    This action is irreversible. All organization data will be permanently erased.
                                    Make sure to export anything important before proceeding.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setShowDeletePage(true)}
                                    className="inline-flex flex-shrink-0 items-center justify-center whitespace-nowrap px-4 py-2 rounded-md bg-red-600 text-sm font-medium text-white hover:bg-wc-danger transition-colors cursor-pointer"
                                >
                                    Delete Account
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrganizationPage
