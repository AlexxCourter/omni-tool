import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientMount from "./ClientMount";

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
    icon: '/omnitool.png',
    shortcut: '/omnitool.png',
    apple: '/omnitool.png',
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
        {/* Explicit icon links so the app uses public/omnitool.png */}
        <link rel="icon" href="/omnitool.png" />
        <link rel="shortcut icon" href="/omnitool.png" />
        <link rel="apple-touch-icon" href="/omnitool.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientMount>{children}</ClientMount>
      </body>
    </html>
  );
}
