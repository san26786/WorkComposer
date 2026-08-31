"use client";

import { X, Check, SendHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import API from "@/api";
import { TbSelector } from "react-icons/tb";
import toast from 'react-hot-toast';

const roles = [
    "user",
    "manager",
    "admin",
]

type BulkInvitesProps = {
    setShowBulkInvite: React.Dispatch<React.SetStateAction<boolean>>;
    setUsers: React.Dispatch<React.SetStateAction<any[]>>;
    onUserAdded: () => Promise<void>;
};


const BulkInvites = ({
    setShowBulkInvite,
    setUsers,
    onUserAdded,
}: BulkInvitesProps) => {

    const [emails, setEmails] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [teamDropdown, setTeamDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    type FailedEmail = {
        email: string;
        reason: string;
    };

    const [failedEmails, setFailedEmails] = useState<FailedEmail[]>([]);
    const [selectedRole, setSelectedRole] = useState("user");
    const [roleDropdown, setRoleDropdown] = useState(false);
    const [teams, setTeams] = useState<any[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        const emailArray = emails
            .split(/[\n,|]+/)
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);

        // No emails
        if (emailArray.length === 0) {
            toast.error("Please enter at least one email");
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const invalidEmails = emailArray.filter(
            (email) => !emailRegex.test(email)
        );

        if (invalidEmails.length > 0) {
            toast.error(
                `Invalid email(s): ${invalidEmails.join(", ")}`
            );
            return;
        }

        // Duplicate emails in the same request
        const duplicateEmails = emailArray.filter(
            (email, index) =>
                emailArray.indexOf(email) !== index
        );

        if (duplicateEmails.length > 0) {
            toast.error(
                `Duplicate email: ${duplicateEmails[0]}`
            );
            return;
        }

        // Team required
        if (!selectedTeam) {
            toast.error("Please select a team");
            return;
        }

        try {
            setLoading(true);
            setFailedEmails([]);

            const res = await API.post("/users/bulk-invite", {
                emails: emailArray,
                role: selectedRole,
                team: selectedTeam,
            });

            // Refresh users without refreshing browser
            await onUserAdded();

            // Successful invitations
            if (res.data.success?.length > 0) {
                toast.success(
                    res.data.success.length === 1
                        ? "Invitation sent successfully"
                        : `${res.data.success.length} invitations sent successfully`
                );
            }

            // Failed invitations
            if (res.data.failed?.length > 0) {
                setFailedEmails(res.data.failed);

                toast.error(
                    `${res.data.failed.length} invitation(s) failed`
                );
            } else {
                setShowBulkInvite(false);
            }

            setEmails("");

        } catch (err: any) {
            console.error("BULK INVITE ERROR:", err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to send invitations"
            );
        } finally {
            setLoading(false);
        }
    };
    const fetchTeams = async () => {
        try {
            const res = await API.get("/teams");
            setTeams(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    return (
        <>
            <div role="dialog" className="relative z-50" aria-modal="true">
                <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"></div>
                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full w-full max-w-md p-6">

                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold leading-6 text-gray-900"> Invite Multiple Users</h2>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowBulkInvite(false)
                                    }
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none" aria-label="Close">
                                    <X className='h-5 w-5' />
                                </button>
                            </div>

                            <div className='border-t border-gray-200 my-4'></div>
                            <div className='text-sm text-gray-600'>Send invitation(s) to join your organization</div>
                            <div className='mt-1 text-xs font-medium text-gray-500'> Enter a comma-separated list of the email addresses to invite.</div>

                            {failedEmails.length > 0 && (

                                <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3">

                                    <p className="text-sm font-medium text-yellow-800 mb-2">
                                        Failed Invitations
                                    </p>

                                    <ul className="space-y-1 text-sm text-yellow-700">

                                        {failedEmails.map((item, index) => (
                                            <li key={`${item.email}-${index}`}>
                                                <span className="font-medium">
                                                    •  {item.email}
                                                </span>

                                                <span className="text-gray-500">
                                                    {" — "}
                                                    {item.reason}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}
                                className='mt-4 space-y-5'>
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 transition-all duration-200 hover:shadow-sm">
                                    <label htmlFor="emails" className='block text-sm font-medium text-gray-700 mb-1'>Email Addresses</label>
                                    <textarea id="emails"
                                        rows={7}
                                        value={emails}
                                        onChange={(e) =>
                                            setEmails(e.target.value)
                                        }
                                        placeholder='user1@mail.com, user2@email.com, user3@email.com ...' className='block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'></textarea>
                                </div>
                                <div className='p-4 rounded-lg bg-gray-50 border border-gray-100'>
                                    <label id="team-label" className='block text-sm font-medium text-gray-700 mb-1'>Team</label>

                                    <div className='relative'>
                                        <button type='button'
                                            onClick={() =>
                                                setTeamDropdown(!teamDropdown)
                                            }
                                            aria-haspopup='listbox' aria-expanded='true' aria-labelledby="team-label" aria-controls="team-listbox" className='relative w-full cursor-default rounded-md border-0 py-2 px-3 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'>
                                            <span className="block truncate">
                                                {teams.find((team) => team._id === selectedTeam)?.name ||
                                                    "Select team"}
                                            </span>
                                            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                                                <TbSelector className='h-5 w-5 text-gray-400' />
                                            </span>
                                        </button>

                                        {teamDropdown && (
                                            <ul id="team-listbox" aria-orientation='vertical' role='listbox' aria-labelledby="team-label" className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm'>

                                                {teams.map((team) => (
                                                    <li
                                                        key={team._id}
                                                        onClick={() => {
                                                            setSelectedTeam(team._id);
                                                            setTeamDropdown(false);
                                                        }}
                                                        className="text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
                                                        role="option"
                                                        aria-selected={selectedTeam === team._id}
                                                    >
                                                        <span className="font-medium block truncate">
                                                            {team.name}
                                                        </span>

                                                        {selectedTeam === team._id && (
                                                            <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                                                <Check className="h-5 w-5" />
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className='p-4 rounded-lg bg-gray-50 border border-gray-100'>
                                    <label
                                        id="role-label"
                                        className='block text-sm font-medium text-gray-700 mb-1'
                                    >
                                        Role
                                    </label>

                                    <div className='relative'>

                                        <button
                                            type='button'
                                            onClick={() =>
                                                setRoleDropdown(!roleDropdown)
                                            }
                                            aria-haspopup='listbox'
                                            aria-expanded={roleDropdown}
                                            aria-labelledby="role-label"
                                            className='relative w-full cursor-default rounded-md border-0 py-2 px-3 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
                                        >
                                            <span className='block truncate capitalize'>
                                                {selectedRole}
                                            </span>

                                            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                                                <TbSelector className='h-5 w-5 text-gray-400' />
                                            </span>
                                        </button>

                                        {roleDropdown && (
                                            <ul
                                                role='listbox'
                                                className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm'
                                            >

                                                {roles.map((role) => (

                                                    <li
                                                        key={role}
                                                        onClick={() => {
                                                            setSelectedRole(role);
                                                            setRoleDropdown(false);
                                                        }}
                                                        className='text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9'
                                                    >
                                                        <span className='block truncate capitalize'>
                                                            {role}
                                                        </span>

                                                        {selectedRole === role && (
                                                            <span className='text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4'>
                                                                <Check className='h-5 w-5' />
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className='mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setShowBulkInvite(false)
                                        }
                                        className='rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'>Cancel</button>
                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors duration-200'>
                                        <SendHorizontal className='h-5 w-5' />
                                        {loading ? "Sending.." : "Send Invitations"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BulkInvites
