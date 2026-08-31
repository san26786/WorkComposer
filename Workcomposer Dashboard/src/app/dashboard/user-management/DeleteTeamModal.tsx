"use client";

import API from "@/api";

const DeleteTeamModal = ({
    selectedTeam,
    setShowDeleteModal,
    fetchTeams,
}: any) => {

    const handleDelete = async () => {
        try {
            await API.delete(`/teams/${selectedTeam._id}`);

            fetchTeams();

            setShowDeleteModal(false);
        } catch (err) {
            console.error(err)
        }
    };

    return (
        <>
            <div role='dialog' className='relative z-10' aria-modal='true'>
                <div className='fixed inset-0 bg-black/50'></div>
                <div className='fixed inset-0 z-10 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <div className='w-full max-w-sm rounded bg-white p-6'>
                            <h2 className='text-lg font-medium text-gray-900'>Delete Team</h2>
                            <p className='mt-2 text-sm text-gray-500'>Are you sure delete {" "}
                                <span className="font-semibold">{selectedTeam?.name}</span>
                                ?</p>
                            <div className='mt-6 flex justify-end space-x-2'>
                                <button
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold cursor-pointer'>Cancel</button>
                                <button
                                    onClick={handleDelete}
                                    className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 font-semibold cursor-pointer'>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeleteTeamModal
