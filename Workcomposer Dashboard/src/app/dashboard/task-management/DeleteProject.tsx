"use client";

import API from "@/api";

const DeleteProject = ({
    selectedProject,
    setShowDeleteProjectModal,
    fetchProjects,
}: {
    selectedProject: any;
    setShowDeleteProjectModal: React.Dispatch<React.SetStateAction<boolean>>;
    fetchProjects: () => Promise<void>;
}) => {

    const handleDelete = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            await API.delete(`/projects/${selectedProject._id}`);

            await fetchProjects();

            setShowDeleteProjectModal(false);
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <>
            <div role="dialog" className="relative z-50">
                <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"></div>
                <div
                    onClick={() =>
                        setShowDeleteProjectModal(false)
                    }
                    className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            className="relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">

                            <header className="text-lg font-semibold text-gray-900">Delete Project</header>
                            <div className="mt-4">
                                <form
                                    onSubmit={handleDelete}
                                    className="space-y-4 text-center px-4 sm:px-6">
                                    <p className="text-base text-gray-900 font-medium"> Are you sure you want to delete this project? </p>
                                    <p className="text-sm text-gray-600"> You are going to delete{" "}
                                        <span className="font-semibold text-red-600">{selectedProject?.taskCount || 0}</span> {" "}
                                        open task(s).
                                    </p>
                                    <div className="pt-4">
                                        <button
                                            type="submit"                                            
                                            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"> Delete Project </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeleteProject
