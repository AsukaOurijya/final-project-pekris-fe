import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import { AcademicDataProvider } from "./state/AcademicDataProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tugas Tracker | Pekris",
  description:
    "Tracker tugas sederhana untuk mengelola mata kuliah, tugas, dan progres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AcademicDataProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <NavBar />
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          </div>
        </AcademicDataProvider>
      </body>
    </html>
  );
}
