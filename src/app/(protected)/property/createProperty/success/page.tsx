"use client";

import { CheckCircle, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PropertyCreatedSuccess() {
    return (
        <main className="container mx-auto p-6 flex items-center justify-center min-h-[85vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="text-center shadow-2xl border-0 overflow-hidden bg-background">
                    {/* Decorative Top Border */}
                    <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

                    <CardContent className="pt-12 pb-10 px-8 space-y-8">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.2,
                                    }}
                                    className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-5 shadow-lg shadow-green-500/30"
                                >
                                    <CheckCircle
                                        className="h-10 w-10 text-white"
                                        strokeWidth={3}
                                    />
                                </motion.div>
                                {/* Glow Ring */}
                                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Property Submitted!
                            </h1>
                            <p className="text-muted-foreground leading-relaxed text-base">
                                Your listing has been successfully created and is now{" "}
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                    pending approval
                                </span>
                                . It will be live on the marketplace once reviewed.
                            </p>
                        </div>

                        {/* Info Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-sm text-amber-900 dark:text-amber-200"
                        >
                            <p className="flex gap-2 items-start justify-center text-left sm:text-center">
                                <span className="text-lg">⏳</span>
                                <span>
                                    Our team typically reviews listings within{" "}
                                    <strong>24-48 hours</strong>. You&apos;ll be notified updates.
                                </span>
                            </p>
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <Link href="/my-listings" className="block">
                                <Button
                                    size="lg"
                                    className="w-full text-base font-semibold h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-300"
                                >
                                    View My Listings
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                            <Link href="/property/createProperty" className="block">
                                <Button variant="ghost" className="w-full text-muted-foreground">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Another Property
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    );
}
