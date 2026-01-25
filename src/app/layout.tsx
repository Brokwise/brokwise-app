import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
