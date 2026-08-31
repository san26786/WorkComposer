"use client"

import { TbExternalLink } from "react-icons/tb";
import GenerateApiKeyModal from "./GenerateApiKeyModal";
import GeneratedApiKeyModal from "./GeneratedApiKeyModal";
import ApiKeyCard from "./ApiKeyCard";
import EditApiKeyModal from "./EditApiKeyModal";
import DeleteApiKeyModal from "./DeleteApiKeyModal";
import useApiKeys from "../hooks/useApiKeys";

export default function ApiKeys() {

    const {
        apiKeys,
        setApiKeys,

        openGenerateModal,
        setOpenGenerateModal,

        showGeneratedModal,
        setShowGeneratedModal,

        generatedKey,
        setGeneratedKey,

        openEditModal,
        setOpenEditModal,

        selectedApiKey,
        setSelectedApiKey,

        openDeleteModal,
        setOpenDeleteModal,

        selectedDeleteKey,
        setSelectedDeleteKey,

        handleGenerate,
        handleGeneratedModalClose,
        handleEdit,
        handleDelete,

        openEdit,
        openDelete,

        closeEdit,
        closeDelete,

        loading,
    } = useApiKeys();


    return (
        <>
            <div className="flex flex-col">
                {/* Header */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setOpenGenerateModal(true)}
                        className="rounded-lg border border-[#2F6BFF] px-5 py-1.5 text-sm font-medium text-[#2F6BFF] hover:bg-blue-50 transition"
                    >
                        Generate a New API Key
                    </button>
                </div>

                {/* Documentation */}
                <div className="mt-8">
                    <p className="text-[15px] text-gray-700">
                        Read the API documentation here:{" "}
                        <button className="inline-flex font-medium text-[#2F6BFF] hover:underline">
                            WorkComposer API Documentation
                            <TbExternalLink className="w-4 h-4 ml-1.5 mt-1"/>
                        </button>
                    </p>
                </div>

                <div className="my-6 border-b border-gray-200" />

                {/* Empty State */}
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : apiKeys.length === 0 ? (
                    <div className="flex h-64 items-center justify-center">
                        <p className="text-lg text-gray-500">
                            You have no API Keys yet.
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="space-y-4">
                            {apiKeys.map((key) => (
                                <ApiKeyCard
                                    key={key.id}
                                    name={key.name}
                                    generatedBy={key.generatedBy}
                                    createdAt={key.createdAt}
                                    maskedKey={key.maskedKey}
                                    onEdit={() => openEdit(key)}
                                    onDelete={() => openDelete(key)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <GenerateApiKeyModal
                open={openGenerateModal}
                onClose={() => setOpenGenerateModal(false)}
                onGenerate={handleGenerate}
            />

            <GeneratedApiKeyModal
                open={showGeneratedModal}
                apiKey={generatedKey.key}
                keyName={generatedKey.name}
                onClose={handleGeneratedModalClose}
            />

            <EditApiKeyModal
                open={openEditModal}
                initialName={selectedApiKey?.name || ""}
                onClose={closeEdit}
                onSave={handleEdit}
            />

            <DeleteApiKeyModal
                open={openDeleteModal}
                onClose={closeDelete}
                onDelete={handleDelete}
            />
        </>
    );
}