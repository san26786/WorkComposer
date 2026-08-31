"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import axios from "axios";

export type ApiKey = {
    id: string;
    name: string;
    maskedKey: string;
    createdAt: string;
    generatedBy: string;
};

export default function useApiKeys() {

    const [loading, setLoading] = useState(true);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

    const [openGenerateModal, setOpenGenerateModal] = useState(false);

    const [showGeneratedModal, setShowGeneratedModal] = useState(false);

    const [generatedKey, setGeneratedKey] = useState({
        name: "",
        key: "",
    });

    const [openEditModal, setOpenEditModal] = useState(false);

    const [selectedApiKey, setSelectedApiKey] =
        useState<ApiKey | null>(null);

    const [openDeleteModal, setOpenDeleteModal] =
        useState(false);

    const [selectedDeleteKey, setSelectedDeleteKey] =
        useState<ApiKey | null>(null);

    const handleGenerate = async (name: string) => {
        try {
            const { data } = await API.post("/api-keys", {
                name,
            });
            toast.success("API key generated successfully.");

            setOpenGenerateModal(false);

            setGeneratedKey({
                name: data.apiKey.name,
                key: data.apiKey.key,
            });

            setShowGeneratedModal(true);
        } catch (error) {
            console.error("API KEY GENERATION ERROR:", error);

            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to generate API key."
                );
            } else {
                toast.error("Failed to generate API key.");
            }
        }
    };

    const handleGeneratedModalClose = async () => {
        setGeneratedKey({
            name: "",
            key: "",
        });

        setShowGeneratedModal(false);

        await fetchApiKeys();
    };

    const handleEdit = async (newName: string) => {
        if (!selectedApiKey) return;

        try {
            await API.patch(`/api-keys/${selectedApiKey.id}`, {
                name: newName,
            });
            toast.success("API key updated successfully.");

            closeEdit();

            await fetchApiKeys();
        } catch (error) {
            console.error("API KEY UPDATE ERROR:", error);

            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to update API key."
                );
            } else {
                toast.error("Failed to update API key.");
            }
        }
    };

    const handleDelete = async () => {
        if (!selectedDeleteKey) return;

        try {
            await API.delete(`/api-keys/${selectedDeleteKey.id}`);
            toast.success("API key deleted successfully.");

            closeDelete();

            await fetchApiKeys();
        } catch (error) {
            console.error("API KEY DELETE ERROR:", error);

            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to delete API key."
                );
            } else {
                toast.error("Failed to delete API key.");
            }
        }
    };

    const openEdit = (key: ApiKey) => {
        setSelectedApiKey(key);
        setOpenEditModal(true);
    };

    const openDelete = (key: ApiKey) => {
        setSelectedDeleteKey(key);
        setOpenDeleteModal(true);
    };

    const closeEdit = () => {
        setOpenEditModal(false);
        setSelectedApiKey(null);
    };

    const closeDelete = () => {
        setOpenDeleteModal(false);
        setSelectedDeleteKey(null);
    };

    const fetchApiKeys = useCallback(async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/api-keys");

            setApiKeys(data.apiKeys);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message || "Something went wrong."
                );
            } else {
                toast.error("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApiKeys();
    }, [fetchApiKeys]);

    return {
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
    };
}