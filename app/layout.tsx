// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import Navbar from "../components/Navbar";
import { Epilogue } from "next/font/google";
import HorizontalScrollBar from "@/components/HorizontalScrollbar";
import Footer from "@/components/Footer";
const epilogue = Epilogue({ subsets: ["latin"] });

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
  return (
    <ClerkProvider>
      <html className="scrollbar-hide " lang="en">
        <body className={`${epilogue.className} max-w-7xl mx-auto tracking-widest bg-gradient-to-b from-black from-20% via-[#595757] via-50% to-zinc-900 to-80%  text-gray-300`}> {/* Choose bg colur if this or bg-zinc-950 */}
          <Navbar />

          <main>
            {children}
          </main>
          <HorizontalScrollBar />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
