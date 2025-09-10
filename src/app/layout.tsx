import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MainContainer } from "@/components/layout/MainContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webspind - PDF Tools & More",
  description: "Fast, private, in-browser PDF and text tools. Merge PDFs, split pages, compress files, OCR scans, and more. You get 3 free credits per day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <MainContainer>
          {children}
        </MainContainer>
        <Footer />
      </body>
    </html>
  );
}
