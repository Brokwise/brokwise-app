"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ScrollToTop() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Give the DOM a moment to settle
        const timer = setTimeout(() => {
            const scrollContainer = document.querySelector(".overflow-auto.h-svh") as HTMLElement;
            if (!scrollContainer) return;

            const handleScroll = () => {
                setShowScrollTop(scrollContainer.scrollTop > 300);
            };

            scrollContainer.addEventListener("scroll", handleScroll);
            return () => scrollContainer.removeEventListener("scroll", handleScroll);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const scrollToTop = () => {
        const scrollContainer = document.querySelector(".overflow-auto.h-svh") as HTMLElement;
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <AnimatePresence>
            {showScrollTop && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                        "fixed z-[9999]", // Gargantuan z-index to force it on top
                        isMobile ? "bottom-36 right-6" : "bottom-24 right-8"
                    )}
                >
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="h-10 w-10 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-transform hover:scale-110 active:scale-95"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
