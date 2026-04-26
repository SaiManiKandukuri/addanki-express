import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Addanki Mart",
  description: "Hyperlocal quick-commerce in Addanki.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#228B22",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // prevents zooming on form focus in iOS for PWA feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><SupabaseProvider>{children}</SupabaseProvider></body>
    </html>
  );
}
