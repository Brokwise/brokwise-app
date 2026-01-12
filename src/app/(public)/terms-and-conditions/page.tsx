"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Terms and Conditions</h1>
                        <p className="text-sm text-slate-500">Last Updated: 12th January 2026</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="prose prose-slate max-w-none">

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">1. Introduction</h2>
                        <p className="text-slate-600">These Terms govern your use of the Brokwise Platform operated by <strong>Brokwise Private Limited</strong>. By using our Platform, you agree to these Terms.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">2. Company Information</h2>
                        <div className="bg-slate-50 rounded-lg p-6 border">
                            <p className="font-semibold text-slate-900">Brokwise Private Limited</p>
                            <p className="text-slate-600">P NO. A-27, BAHUBALI NAGAR, JAIPUR, Mansarovar, Jaipur - 302020, Rajasthan</p>
                            <p className="text-slate-600 mt-2"><strong>Email:</strong> <a href="mailto:support@brokwise.com" className="text-teal-600">support@brokwise.com</a></p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">3. Definitions</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li><strong>&quot;Platform&quot;</strong> - Brokwise mobile app and website</li>
                            <li><strong>&quot;User&quot;</strong> - Any individual or entity using the Platform</li>
                            <li><strong>&quot;Broker&quot;</strong> - Real estate broker registered on the Platform</li>
                            <li><strong>&quot;Property&quot;</strong> - Real estate listing on the Platform</li>
                            <li><strong>&quot;Enquiry&quot;</strong> - Property requirement posted by a User</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">4. Eligibility</h2>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-slate-700">You must be at least <strong className="text-red-700">18 years of age</strong> to use this Platform.</p>
                        </div>
                        <p className="text-slate-600">You must have legal capacity to enter binding contracts. If a broker, you must be duly licensed/registered.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">5. Account</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain confidentiality of account credentials</li>
                            <li>Notify us immediately of unauthorized access</li>
                            <li>One account per user only</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">6. Platform Services</h2>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-slate-700"><strong>Important:</strong> Brokwise acts solely as an intermediary. We do NOT participate in transactions, verify property legal status, or guarantee successful transactions.</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">7. User Conduct</h2>
                        <p className="text-slate-600 mb-3">You shall NOT:</p>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li>Post false, misleading, or fraudulent information</li>
                            <li>Impersonate any person or entity</li>
                            <li>Post content that infringes intellectual property</li>
                            <li>Transmit viruses, malware, or harmful code</li>
                            <li>Engage in spamming or harassment</li>
                            <li>Violate any applicable laws</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">8. Listings</h2>
                        <p className="text-slate-600">Provide accurate information, use authentic photographs, disclose all material facts, and update/remove listings when sold/leased. We may remove violating listings.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">9. Intellectual Property</h2>
                        <p className="text-slate-600">Platform content owned by Brokwise Private Limited. Do NOT copy, modify, or distribute without permission.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">10. Disclaimer</h2>
                        <div className="bg-slate-800 text-white rounded-lg p-5">
                            <p className="font-semibold mb-2">Platform Provided &quot;As Is&quot;</p>
                            <p>We do NOT warrant uninterrupted service, accuracy of listings, or successful transactions. Conduct your own due diligence.</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">11. Liability</h2>
                        <p className="text-slate-600">Brokwise NOT liable for indirect or consequential damages. Liability capped at <strong>INR 10,000</strong> or 12-month fees, whichever is less.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">12. Dispute Resolution</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li><strong>Governing Law:</strong> Laws of India</li>
                            <li><strong>Arbitration:</strong> Under Arbitration Act, 1996</li>
                            <li><strong>Jurisdiction:</strong> Courts in Jaipur, Rajasthan</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">13. Communications</h2>
                        <p className="text-slate-600">You consent to receive promotional emails, SMS, and notifications from Brokwise.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">14. Acknowledgment</h2>
                        <div className="bg-slate-800 text-white rounded-lg p-5">
                            <p className="font-semibold">By using Brokwise, you acknowledge that you have read, understood, and agree to these Terms and Conditions.</p>
                        </div>
                    </section>

                    <div className="text-center text-sm text-slate-500 border-t pt-6 mt-8">
                        <p>These Terms supersede all prior agreements.</p>
                    </div>
                </div>
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
