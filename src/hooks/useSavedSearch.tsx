"use client";

import { useState, useCallback } from "react";
import useAxios from "./useAxios";
import { toast } from "sonner";

interface SavedSearchCriteria {
    searchQuery?: string;
    categoryFilter?: string;
    sourceFilter?: string;
    priceRange?: number[];
    bhkFilter?: string;
}

interface SavedSearch {
    _id: string;
    brokerId: string;
    name: string;
    criteria: SavedSearchCriteria;
    createdAt: string;
    updatedAt: string;
}

export const useSavedSearch = (brokerId: string | undefined) => {
    const axios = useAxios();
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSavedSearches = useCallback(async () => {
        if (!brokerId) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`/saved-searches/${brokerId}`);
            setSavedSearches(response.data);
        } catch (error) {
            console.error("Error fetching saved searches:", error);
        } finally {
            setIsLoading(false);
        }
    }, [axios, brokerId]);

    const saveSearch = useCallback(
        async (name: string, criteria: SavedSearchCriteria) => {
            if (!brokerId) {
                toast.error("Please log in to save searches");
                return null;
            }
            setIsSaving(true);
            try {
                const response = await axios.post("/saved-searches", {
                    brokerId,
                    name,
                    criteria,
                });
                toast.success("Search saved successfully!");
                setSavedSearches((prev) => [response.data, ...prev]);
                return response.data;
            } catch (error) {
                console.error("Error saving search:", error);
                toast.error("Failed to save search");
                return null;
            } finally {
                setIsSaving(false);
            }
        },
        [axios, brokerId]
    );

    const deleteSearch = useCallback(
        async (id: string) => {
            try {
                await axios.delete(`/saved-searches/${id}`);
                setSavedSearches((prev) => prev.filter((s) => s._id !== id));
                toast.success("Saved search deleted");
            } catch (error) {
                console.error("Error deleting saved search:", error);
                toast.error("Failed to delete saved search");
            }
        },
        [axios]
    );

    return {
        savedSearches,
        isLoading,
        isSaving,
        fetchSavedSearches,
        saveSearch,
        deleteSearch,
    };
};
