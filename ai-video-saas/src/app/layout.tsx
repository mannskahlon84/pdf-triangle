import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Market Pilot AI — Enterprise Social Media Video SaaS",
  description:
    "Enterprise-grade AI Social Media Video SaaS platform for SMBs, recruitment agencies, and businesses. Convert raw workplace videos & images into professional marketing reels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen selection:bg-indigo-600 selection:text-white`}
      >
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
