"use client";

import API from "@/api";
import { useEffect, useState } from "react";

const EditTeamModal = ({
    editingTeam,
    setShowEditModal,
    fetchTeams,
}: any) => {

    const [teamName, setTeamName] = useState("");

    useEffect(() => {
        if (editingTeam) {
            setTeamName(editingTeam.name);
        }
    }, [editingTeam]);

    const handleUpdate = async () => {
        try {
            if (!teamName.trim()) {
                return;
            }

            await API.put
                (`/teams/${editingTeam._id}`, {
                    name: teamName,
                });

            fetchTeams();

            setShowEditModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div role='dialog' className='relative z-10' aria-modal='true'>
                <div className='fixed inset-0 bg-black/50'></div>
                <div className='fixed inset-0 z-10 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <div className='w-full max-w-md rounded bg-white p-6'>
                            <h2 className='text-lg font-medium text-gray-900'>Edit Team</h2>

                            <div className='mt-4'>
                                <input
                                    type='text'
                                    value={teamName}
                                    onChange={(e) =>
                                        setTeamName(e.target.value)
                                    }
                                    className='block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6' placeholder='Team name'></input>

                            </div>

                            <div className='mt-6 flex justify-end space-x-2'>
                                <button 
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                                className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold cursor-pointer'>Cancel</button>
                                <button 
                                onClick={handleUpdate}
                                disabled={!teamName.trim()}
                                className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 font-semibold cursor-pointer'>Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EditTeamModal
