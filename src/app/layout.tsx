import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { QueryClientProviderWrapper } from "@/providers/queryClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers/themeProvider";
import { PostHogProvider } from "./providers";
import { DeepLinkHandler } from "@/components/deeplinkhandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brokwise App",
  description: "Brokwise App",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Script
          src="https://t.contentsquare.net/uxa/43df6114dc031.js"
          strategy="beforeInteractive"
        />
        <PostHogProvider>
          <Providers>
            <QueryClientProviderWrapper>
              <DeepLinkHandler />
              {children}
            </QueryClientProviderWrapper>
          </Providers>
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
