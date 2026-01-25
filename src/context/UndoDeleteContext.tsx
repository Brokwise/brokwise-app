"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { UndoDeleteOverlay } from "@/components/property/undo-delete-overlay";
import { useQueryClient } from "@tanstack/react-query";
import { useUndoDeleteProperty } from "@/hooks/useProperty";
import { Property } from "@/types/property";

interface UndoDeleteContextType {
    showUndo: (options: {
        propertyId: string;
        propertyTitle?: string;
        onUndo?: () => Promise<void> | void;
    }) => void;
    hideUndo: () => void;
}

const UndoDeleteContext = createContext<UndoDeleteContextType | null>(null);

export const UndoDeleteProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [propertyId, setPropertyId] = useState<string | null>(null);
    const [propertyTitle, setPropertyTitle] = useState<string | undefined>(undefined);
    const [customUndo, setCustomUndo] = useState<(() => Promise<void> | void) | undefined>(undefined);

    const queryClient = useQueryClient();
    const { undoDelete } = useUndoDeleteProperty();

    const showUndo = useCallback((options: {
        propertyId: string;
        propertyTitle?: string;
        onUndo?: () => Promise<void> | void;
    }) => {
        setPropertyId(options.propertyId);
        setPropertyTitle(options.propertyTitle);
        setCustomUndo(() => options.onUndo);
        setIsOpen(true);
    }, []);

    const hideUndo = useCallback(() => {
        setIsOpen(false);
        setPropertyId(null);
        setCustomUndo(undefined);
        // Invalidate queries when overlay closes (if deletion is final)
        queryClient.invalidateQueries({ queryKey: ["my-listings"] });
        queryClient.invalidateQueries({ queryKey: ["properties"] });
        queryClient.invalidateQueries({ queryKey: ["deleted-properties"] });
    }, [queryClient]);

    const handleUndo = useCallback(async () => {
        // Optimistic update
        if (propertyId) {
            queryClient.setQueryData<Property[]>(["my-listings"], (old) => {
                if (!old) return old;
                return old.map(p => {
                    if (p._id === propertyId) {
                        // Optimistically set to ACTIVE
                        return { ...p, listingStatus: "ACTIVE", deletingStatus: null, deletionReason: undefined };
                    }
                    return p;
                });
            });
            queryClient.setQueryData<Property>(["property", propertyId], (old) => {
                if (!old) return old;
                return { ...old, listingStatus: "ACTIVE", deletingStatus: null, deletionReason: undefined };
            });
        }

        if (customUndo) {
            await customUndo();
        } else if (propertyId) {
            // Default undo behavior
            undoDelete(
                { propertyId },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["my-listings"] });
                        queryClient.invalidateQueries({ queryKey: ["properties"] });
                        queryClient.invalidateQueries({ queryKey: ["deleted-properties"] });
                    },
                    onError: () => {
                        // Revert on error
                        queryClient.invalidateQueries({ queryKey: ["my-listings"] });
                        queryClient.invalidateQueries({ queryKey: ["properties"] });
                    }
                }
            );
        }
        setIsOpen(false);
    }, [customUndo, propertyId, undoDelete, queryClient]);

    return (
        <UndoDeleteContext.Provider value={{ showUndo, hideUndo }}>
            {children}
            <UndoDeleteOverlay
                isOpen={isOpen}
                onUndo={handleUndo}
                onClose={hideUndo}
                propertyTitle={propertyTitle}
                duration={5}
            />
        </UndoDeleteContext.Provider>
    );
};

export const useUndoDelete = () => {
    const context = useContext(UndoDeleteContext);
    if (!context) {
        throw new Error("useUndoDelete must be used within an UndoDeleteProvider");
    }
    return context;
};
