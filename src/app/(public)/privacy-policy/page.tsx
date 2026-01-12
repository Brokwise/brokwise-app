"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Privacy Policy</h1>
                        <p className="text-sm text-slate-500">Last Updated: 12th January 2026</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="prose prose-slate max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">1. Introduction</h2>
                        <p className="text-slate-600">This Privacy Policy explains how <strong>Brokwise Private Limited</strong> collects, uses, and protects your personal information. This policy complies with: IT Act 2000, IT Rules 2011, and Digital Personal Data Protection Act, 2023.</p>
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
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">3. Information We Collect</h2>
                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">Personal Information</h3>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li>Name, email, phone number, address</li>
                            <li>Company name, RERA registration number</li>
                            <li>Profile photograph</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">KYC Documents</h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-slate-700">Aadhaar, PAN collected for verification. <strong className="text-amber-700">Stored securely and NOT shared with third parties.</strong></p>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">Automatic Collection</h3>
                        <p className="text-slate-600">IP address, device info, browser type, usage data, cookies, location (IP-based).</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">4. How We Use Your Information</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li>Account creation and management</li>
                            <li>KYC verification</li>
                            <li>Property listings and enquiries</li>
                            <li>Service notifications and marketing</li>
                            <li>Analytics and platform improvement</li>
                            <li>Legal compliance</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">5. Data Sharing</h2>
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 mb-4">
                            <p className="text-teal-700 font-semibold">🔒 We do NOT share, sell, or trade your personal information with third parties.</p>
                        </div>
                        <p className="text-slate-600">Limited disclosure only for: legal requirements, protection of rights, service providers under strict confidentiality.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">6. Data Storage & Security</h2>
                        <p className="text-slate-600">Data stored on <strong>India-based servers</strong> (Vercel, Digital Ocean). Security includes encryption, firewalls, access controls, and security audits.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">7. Your Rights</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li><strong>Access:</strong> Obtain copy of your data</li>
                            <li><strong>Download:</strong> Request data export</li>
                            <li><strong>Correction:</strong> Fix inaccurate data</li>
                            <li><strong>Withdraw Consent:</strong> Subject to legal obligations</li>
                            <li><strong>Grievance:</strong> Complain to Data Protection Board</li>
                        </ul>
                        <p className="text-slate-600 mt-3">Contact: <a href="mailto:support@brokwise.com" className="text-teal-600">support@brokwise.com</a></p>
                        <p className="text-slate-500 text-sm mt-2">Note: Account deletion is currently not available.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">8. Cookies</h2>
                        <p className="text-slate-600">We use cookies for preferences, authentication, analytics, and personalization. Control via browser settings.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">9. Marketing</h2>
                        <p className="text-slate-600">By using our Platform, you consent to receive promotional emails, SMS, and notifications.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">10. Age Requirement</h2>
                        <p className="text-slate-600">Platform is for users <strong>18 years or older</strong>. We do not collect data from minors.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">11. Grievance Officer</h2>
                        <p className="text-slate-600">Contact at <strong>support@brokwise.com</strong>. Response within 30 days.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-3 mb-4">12. Consent</h2>
                        <div className="bg-slate-800 text-white rounded-lg p-5">
                            <p>By using Brokwise, you consent to this Privacy Policy and agree to its terms.</p>
                        </div>
                    </section>

                    <div className="text-center text-sm text-slate-500 border-t pt-6 mt-8">
                        <p>Governed by laws of India. Jurisdiction: Courts in Jaipur, Rajasthan.</p>
                    </div>
                </div>
            </main>

            <footer className="bg-slate-50 border-t py-6">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-slate-500">© {new Date().getFullYear()} Brokwise Private Limited</p>
                    <div className="flex justify-center gap-4 mt-3">
                        <Link href="/terms-and-conditions" className="text-sm text-teal-600 hover:underline">Terms & Conditions</Link>
                        <span className="text-slate-300">|</span>
                        <Link href="/privacy-policy" className="text-sm text-teal-600 font-medium">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
