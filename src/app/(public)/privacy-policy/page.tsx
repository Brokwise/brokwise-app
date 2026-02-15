"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { LEGAL_DOC_LINKS } from "@/constants/legal";

export default function PrivacyPolicyPage() {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/legal/privacy-policy.md")
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
                        <h1 className="text-xl font-semibold text-slate-900">Privacy Policy</h1>
                        <p className="text-sm text-slate-500">Brokwise Private Limited</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Canonical PDF:{" "}
                            <a
                                href={LEGAL_DOC_LINKS.privacyPolicy}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:underline"
                            >
                                View signed policy document
                            </a>
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
                    </div>
                ) : (
                    <article className="legal-content">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 mt-8">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">{children}</h3>
                                ),
                                p: ({ children }) => (
                                    <p className="text-slate-600 leading-relaxed mb-4">{children}</p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4 ml-2">{children}</ul>
                                ),
                                li: ({ children }) => (
                                    <li className="text-slate-600 leading-relaxed">{children}</li>
                                ),
                                strong: ({ children }) => (
                                    <strong className="text-slate-800 font-semibold">{children}</strong>
                                ),
                                hr: () => (
                                    <hr className="my-8 border-slate-200" />
                                ),
                                a: ({ children, href }) => (
                                    <a href={href} className="text-teal-600 hover:underline">{children}</a>
                                ),
                                em: ({ children }) => (
                                    <em className="text-slate-500 text-sm">{children}</em>
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </article>
                )}
            </main>

            <footer className="bg-slate-50 border-t py-6 mt-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-slate-500">© {new Date().getFullYear()} Brokwise Private Limited</p>
                    <div className="flex justify-center gap-4 mt-3">
                        <a href={LEGAL_DOC_LINKS.masterTerms} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">Master Platform Terms</a>
                        <span className="text-slate-300">|</span>
                        <a href={LEGAL_DOC_LINKS.brokerTerms} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">Terms of Use for Brokers</a>
                        <span className="text-slate-300">|</span>
                        <a href={LEGAL_DOC_LINKS.privacyPolicy} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 font-medium">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
