"use client";

import { CheckCircle, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

export default function EnquiryCreatedSuccess() {
  const { companyData } = useApp();
  const enquiriesHref = companyData ? "/company-enquiries" : "/my-enquiries";
  const enquiriesLabel = companyData ? "View Company Enquiries" : "View My Enquiries";

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
                  <CheckCircle className="h-10 w-10 text-white" strokeWidth={3} />
                </motion.div>
                {/* Glow Ring */}
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Enquiry Submitted!
              </h1>
              <p className="text-muted-foreground leading-relaxed text-base">
                Your enquiry has been created successfully. You can track it from your
                enquiries page.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link href={enquiriesHref} className="block">
                <Button
                  size="lg"
                  className="w-full text-base font-semibold h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  {enquiriesLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/enquiries/create" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Another Enquiry
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}


