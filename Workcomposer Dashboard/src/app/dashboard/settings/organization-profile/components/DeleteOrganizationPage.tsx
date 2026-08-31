"use client"

import { useEffect, useState } from "react";
import API from "@/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SettingsLoading from "@/components/settings/SettingsLoading";

type DeleteOrganizationProps = {
    onClose: () => void;
};

const DeleteOrganizationPage = ({
    onBack,
}: {
    onBack: () => void;
}) => {
    const router = useRouter();

    const [selectedReason, setSelectedReason] = useState("");
    const [organization, setOrganization] = useState({
        name: "",
    });

    const [confirmName, setConfirmName] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                setPageLoading(true);

                const { data } = await API.get("/organization");

                setOrganization({
                    name: data.name,
                });
            } catch (err: any) {
                console.error("DELETE ORGANIZATION PAGE FETCH ERROR:", err);

                toast.error(
                    err.response?.data?.message ||
                    "Failed to load organization."
                );
            } finally {
                setPageLoading(false);
            }
        };

        fetchOrganization();
    }, []);

    const handleDeleteOrganization = async () => {
        try {
            setLoading(true);

            await API.delete("/organization", {
                data: {
                    organizationName: confirmName,
                    reason: selectedReason,
                },
            });

            toast.success("Organization deleted successfully.");

            localStorage.removeItem("workcomposer_access_token");

            const electronAPI =
                typeof window !== "undefined" ? window.electronAPI : null;

            if (electronAPI) {
                await electronAPI.saveToken("", "");
            }

            setTimeout(() => {
                router.replace("/authenticate/login");
            }, 1500);
        } catch (err: any) {
            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Failed to delete organization."
            );
        } finally {
            setLoading(false);
        }
    };

    const canDelete =
        selectedReason &&
        confirmName.trim() === organization.name.trim();

    if (pageLoading) {
        return (
            <div className='py-10 flex-1'>
                <div className='mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8'>
                    <SettingsLoading />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='py-10 flex-1'>
                <div className='mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8'>
                    <div className='min-h-[calc(100vh-250px)] px-2 sm:px-4 my-2 py-4 rounded-lg bg-wc-surface-2 shadow-sm'>
                        <div className='mx-auto p-6'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Delete Your Account</h2>

                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                                <h3 className="font-semibold text-red-700">
                                    This action cannot be undone.
                                </h3>

                                <p className="mt-2 text-sm text-red-600">
                                    Deleting this organization will permanently remove:
                                </p>

                                <ul className="mt-3 ml-5 list-disc text-sm text-red-600 space-y-1">
                                    <li>All users</li>
                                    <li>All projects</li>
                                    <li>All tasks</li>
                                    <li>All teams</li>
                                    <li>Attendance records</li>
                                    <li>Time tracking</li>
                                    <li>Screenshots</li>
                                    <li>Reports</li>
                                    <li>Organization settings</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-base font-medium text-wc-text mb-2'>Why are you deleting this account?</h3>
                                <fieldset className='space-y-4'>

                                    <div className='flex items-center'>
                                        <input
                                            type="radio"
                                            id="reason-1"
                                            name="delete-reason"
                                            checked={selectedReason === "I don't need it anymore"}
                                            onChange={() =>
                                                setSelectedReason("I don't need it anymore")
                                            }
                                            className="h-4 w-4 cursor-pointer accent-wc-primary border-wc-border focus:ring-wc-primary"
                                        />
                                        <label htmlFor='reason-1' className='ml-3 block text-sm font-medium text-wc-text'>I don&apos;t need it anymore</label>
                                    </div>

                                    <div className='flex items-center'>
                                        <input type='radio' id='reason-2' name='delete-reason'
                                            checked={selectedReason === "It's too expensive"}
                                            onChange={() =>
                                                setSelectedReason("It's too expensive")
                                            }
                                            className="h-4 w-4 cursor-pointer accent-wc-primary border-wc-border focus:ring-wc-primary"
                                        />
                                        <label htmlFor='reason-2' className='ml-3 block text-sm font-medium text-wc-text'>It&apos;s too expensive</label>
                                    </div>

                                    <div className='flex items-center'>
                                        <input type='radio' id='reason-3' name='delete-reason'
                                            checked={selectedReason === "It's too difficult to use"}
                                            onChange={() =>
                                                setSelectedReason("It's too difficult to use")
                                            }
                                            className="h-4 w-4 cursor-pointer accent-wc-primary border-wc-border focus:ring-wc-primary"
                                        />
                                        <label htmlFor='reason-3' className='ml-3 block text-sm font-medium text-wc-text'>It&apos;s too difficult to use</label>
                                    </div>

                                    <div className='flex items-center'>
                                        <input type='radio' id='reason-4' name='delete-reason'
                                            checked={selectedReason === "I'm switching to someone else"}
                                            onChange={() =>
                                                setSelectedReason("I'm switching to someone else")
                                            }
                                            className="h-4 w-4 cursor-pointer accent-wc-primary border-wc-border focus:ring-wc-primary"
                                        />
                                        <label htmlFor='reason-4' className='ml-3 block text-sm font-medium text-wc-text'>I&apos;m switching to someone else</label>
                                    </div>

                                    <div className='flex items-center'>
                                        <input type='radio' id='reason-5' name='delete-reason'
                                            checked={selectedReason === "Other"}
                                            onChange={() =>
                                                setSelectedReason("Other")
                                            }
                                            className="h-4 w-4 cursor-pointer accent-wc-primary border-wc-border focus:ring-wc-primary"
                                        />
                                        <label htmlFor='reason-5' className='ml-3 block text-sm font-medium text-wc-text'>Other</label>
                                    </div>

                                </fieldset>

                                <div className="mt-8">
                                    <label className="block text-sm font-medium text-wc-text mb-2">
                                        Type your organization name to confirm
                                    </label>

                                    <input
                                        type="text"
                                        value={confirmName}
                                        onChange={(e) => setConfirmName(e.target.value)}
                                        placeholder={organization.name}
                                        className="w-full rounded-md border border-wc-border px-3 py-2"
                                    />

                                    <p className="mt-2 text-xs text-wc-text-3">
                                        Enter <strong>{organization.name}</strong> exactly.
                                    </p>
                                </div>

                                <div className='mt-6 flex justify-end gap-3'>
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="px-4 py-2 text-sm font-medium text-wc-text-2 border border-wc-border rounded hover:bg-wc-surface font-semibold cursor-pointer"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteOrganization}
                                        disabled={!canDelete || loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Deleting..." : "Delete Organization"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeleteOrganizationPage;
