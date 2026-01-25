"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Undo2, AlertCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UndoDeleteOverlayProps {
    isOpen: boolean;
    onUndo: () => void;
    onClose: () => void;
    propertyTitle?: string;
    duration?: number; // in seconds
}

export function UndoDeleteOverlay({
    isOpen,
    onUndo,
    onClose,
    propertyTitle,
    duration = 5,
}: UndoDeleteOverlayProps) {
    const [countdown, setCountdown] = useState(duration);
    const [progress, setProgress] = useState(100);
    const { t } = useTranslation();

    // Reset countdown when overlay opens
    useEffect(() => {
        if (isOpen) {
            setCountdown(duration);
            setProgress(100);
        }
    }, [isOpen, duration]);

    // Countdown timer
    useEffect(() => {
        if (!isOpen) return;

        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            const progressValue = Math.max(0, ((endTime - now) / (duration * 1000)) * 100);

            setCountdown(remaining);
            setProgress(progressValue);

            if (remaining <= 0) {
                clearInterval(interval);
                onClose();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen, duration, onClose]);

    const handleUndo = useCallback(() => {
        onUndo();
        onClose();
    }, [onUndo, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                >
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ backdropFilter: "blur(0px)" }}
                        animate={{ backdropFilter: "blur(8px)" }}
                        exit={{ backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 bg-black/60"
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 w-full max-w-md mx-4"
                    >
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
                            {/* Progress bar */}
                            <div className="h-1 bg-slate-700 overflow-hidden">
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "linear" }}
                                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                                />
                            </div>

                            <div className="p-6 sm:p-8">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.1 }}
                                        className="relative"
                                    >
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                                        <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-full">
                                            <AlertCircle className="h-8 w-8 text-white" />
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="text-xl sm:text-2xl font-bold text-white text-center mb-2"
                                >
                                    {t("undo_delete_title") || "Property Deleted"}
                                </motion.h2>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-slate-400 text-center mb-6"
                                >
                                    {propertyTitle ? (
                                        <>
                                            <span className="text-slate-300 font-medium">{propertyTitle}</span>
                                            <br />
                                            {t("undo_delete_desc") || "has been deleted. You can undo this action."}
                                        </>
                                    ) : (
                                        t("undo_delete_desc_generic") || "The property has been deleted. Click below to restore it."
                                    )}
                                </motion.p>

                                {/* Countdown */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex justify-center mb-6"
                                >
                                    <div className="relative">
                                        <svg className="w-20 h-20 transform -rotate-90">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                                className="text-slate-700"
                                            />
                                            <motion.circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="url(#gradient)"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={226}
                                                initial={{ strokeDashoffset: 0 }}
                                                animate={{ strokeDashoffset: 226 - (countdown / duration) * 226 }}
                                                transition={{ duration: 1, ease: "linear" }}
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#f97316" />
                                                    <stop offset="100%" stopColor="#ef4444" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">{countdown}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Actions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-col sm:flex-row gap-3"
                                >
                                    <Button
                                        onClick={handleUndo}
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-[1.02]"
                                    >
                                        <Undo2 className="mr-2 h-5 w-5" />
                                        {t("action_undo") || "Undo Delete"}
                                    </Button>
                                    <Button
                                        onClick={onClose}
                                        variant="outline"
                                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white py-6 text-lg rounded-xl transition-all"
                                    >
                                        {t("action_dismiss") || "Dismiss"}
                                    </Button>
                                </motion.div>

                                {/* Hint */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs text-slate-500 text-center mt-4"
                                >
                                    {t("undo_delete_hint") || "This window will close automatically"}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
