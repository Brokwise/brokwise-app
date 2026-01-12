"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

export default function TermsAndConditionsPage() {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/legal/terms-and-conditions.md")
            .then((res) => res.text())
            .then((text) => {
                setContent(text);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Terms and Conditions</h1>
                        <p className="text-sm text-slate-500">Brokwise Private Limited</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
                    </div>
                ) : (
                    <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h2:mb-4 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-800 prose-a:text-teal-600">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                )}
            </main>

            <footer className="bg-slate-50 border-t py-6">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-slate-500">© {new Date().getFullYear()} Brokwise Private Limited</p>
                    <div className="flex justify-center gap-4 mt-3">
                        <Link href="/terms-and-conditions" className="text-sm text-teal-600 font-medium">Terms & Conditions</Link>
                        <span className="text-slate-300">|</span>
                        <Link href="/privacy-policy" className="text-sm text-teal-600 hover:underline">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
