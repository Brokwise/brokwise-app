import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "../globals.css";
import { QueryClientProviderWrapper } from "@/providers/queryClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers/themeProvider";
import { PostHogProvider } from "./providers";
import { DeepLinkHandler } from "@/components/deeplinkhandler";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
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
      <body className={`${inter.variable} antialiased`}>
        <Toaster />
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WWKVWDVS');`,
          }}
        />
        <Script
          src="https://t.contentsquare.net/uxa/43df6114dc031.js"
          strategy="beforeInteractive"
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WWKVWDVS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <PostHogProvider>
          <Providers>
            <QueryClientProviderWrapper>
              <DeepLinkHandler />
              {children}
            </QueryClientProviderWrapper>
          </Providers>

        </PostHogProvider>
      </body>
    </html>
  );
}
