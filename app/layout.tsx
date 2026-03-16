import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientMount from "./ClientMount";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OMNI-TOOL",
  description: "A small collection of mini-tools",
  icons: {
    icon: '/omni-tool-logo-2.png',
    shortcut: '/omni-tool-logo-2.png',
    apple: '/omni-tool-logo-2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Explicit icon links so the app uses public/omni-tool-logo-2.png */}
        <link rel="icon" href="/omni-tool-logo-2.png" />
        <link rel="shortcut icon" href="/omni-tool-logo-2.png" />
        <link rel="apple-touch-icon" href="/omni-tool-logo-2.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientMount>{children}</ClientMount>
        <Analytics />
      </body>
    </html>
  );
}
