"use client";

import React, { useState } from 'react'
import API from "@/api";
import toast from 'react-hot-toast';

interface CreateTeamModalPropa {
    setShowTeamModal: React.Dispatch<React.SetStateAction<boolean>>;
    fetchTeams: () => void;
    editingTeam: any;
    setEditingTeam: React.Dispatch<React.SetStateAction<any>>;
}

const CreateTeamModal = ({
    setShowTeamModal,
    fetchTeams
}: CreateTeamModalPropa) => {
    const [teamName, setTeamName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            alert("Team name is required");
            return;
        }

        try {
            setLoading(true);
            await API.post("/teams", {
                name: teamName,
            });

            toast.success("Team created successfully");

            fetchTeams();

            setShowTeamModal(false);
        } catch (err: any) {
            console.error(err);

            toast.error(err?.response?.data?.message || "Failed to create team")
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className='relative z-10' aria-modal='true'>
                <div className='fixed inset-0 bg-black/50'></div>
                <div className='fixed inset-0 z-10 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <div className='w-full max-w-md rounded bg-white p-6'>
                            <h2 className='text-lg font-medium text-gray-900'>Create a new Team</h2>
                            <div className='mt-4'>
                                <input
                                    type='text'
                                    value={teamName}
                                    onChange={(e) =>
                                        setTeamName(e.target.value)
                                    }
                                    placeholder='Team name' className='w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500'></input>
                            </div>

                            <div className='mt-6 flex justify-end space-x-2'>
                                <button
                                    onClick={() =>
                                        setShowTeamModal(false)
                                    }
                                    className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold cursor-pointer'>Cancel</button>
                                <button
                                    onClick={handleCreateTeam}
                                    className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 font-semibold cursor-pointer'>{loading ? "Creating..." : "Create"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateTeamModal
