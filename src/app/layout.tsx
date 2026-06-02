import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DarkModeToggle from "@/components/layout/DarkModeToggle";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BoletoClick",
  description: "Tu plataforma de venta de entradas online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-text transition-colors duration-200">
        <Providers>
          <Navbar />

          <main className="grow w-full max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>

          <Footer />

          <DarkModeToggle />
        </Providers>
      </body>
    </html>
  );
}
