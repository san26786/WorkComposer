"use client";


interface DeleteTaskModalProps {
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>
    >;


    handleDeleteTask: () =>
        Promise<void>;

    deleting: boolean;
}
const DeleteTaskModal = ({
    setShowDeleteModal,
    handleDeleteTask,
    deleting,
}: DeleteTaskModalProps) => {

    return (
        <>
            <div role='dialog' className='relative z-[60]'>
                <div
                    onClick={() =>
                        setShowDeleteModal(false)
                    }
                    className='fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity'></div>
                <div className='fixed inset-0 z-[70] overflow-y-auto'>
                    <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            className='relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                            <h2 className='text-lg font-medium text-gray-900'>Confirm Delete</h2>
                            <p className='mt-2 text-sm text-gray-500'>Are you sure you want to delete this task?</p>
                            <div className='mt-6 flex justify-end space-x-2'>
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    className='inline-flex justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'>Cancel</button>
                                <button
                                    type='button'
                                    onClick={handleDeleteTask}
                                    className='inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600'>{deleting ? "Deleting..." : "Delete"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeleteTaskModal
