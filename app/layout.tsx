// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import HorizontalScrollBar from "@/components/ui/horizontal-scrollbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/providers/ToastProvider";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Your SaaS Name | Build Modern Websites",
  description:
    "Create stunning websites effortlessly with our modern, drag-and-drop website builder. Perfect for small businesses in Azerbaijan.",
  keywords: [
    "website builder",
    "SaaS",
    "drag-and-drop",
    "Azerbaijan",
    "small business website",
  ],
  openGraph: {
    title: "Your SaaS Name | Build Modern Websites",
    description:
      "Create stunning websites effortlessly with our modern, drag-and-drop website builder.",
    url: "https://yourdomain.az",
    siteName: "Your SaaS Name",
    images: [
      {
        url: "https://yourdomain.az/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your SaaS Name | Build Modern Websites",
    description:
      "Create stunning websites effortlessly with our modern, drag-and-drop website builder.",
    images: ["https://yourdomain.az/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

  return (
    <ClerkProvider>
      <html className="scrollbar-hide" lang="en">
        <body className="max-w-7xl mx-auto tracking-widest bg-linear-to-b from-black from-20% via-[#565454] via-50% to-zinc-900 to-80% text-gray-200 font-sans"> {/* Choose bg colur if this or bg-zinc-950 */}
          <GoogleAnalytics gaId={gaId} />
          <ToastProvider />

          <main>
            {children}
          </main>
          <HorizontalScrollBar />

        </body>
      </html>
    </ClerkProvider>
  );
}
