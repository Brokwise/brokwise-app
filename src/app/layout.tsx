import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { QueryClientProviderWrapper } from "@/providers/queryClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers/themeProvider";
import { PostHogProvider } from "./providers";

const hostGrotesk = localFont({
  src: "../../public/fonts/HostGrotesk-VariableFont_wght.ttf",
  variable: "--font-host-grotesk",
  weight: "100 900",
});
const instrumentSerif = localFont({
  src: "../../public/fonts/InstrumentSerif-Regular.ttf",
  variable: "--font-instrument-serif",
  weight: "400",
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
        className={`${hostGrotesk.variable} ${instrumentSerif.variable} antialiased`}
      >
        <PostHogProvider>
          <Providers>
            <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
          </Providers>
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
