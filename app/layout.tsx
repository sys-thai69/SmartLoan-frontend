import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorNotification } from "@/components/ErrorNotification";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartLoan - Peer-to-Peer Loan Tracker",
  description: "Digitalize informal cash lending between friends, family, and colleagues. Built for Wing Bank Cambodia.",
  keywords: ["loan", "peer-to-peer", "wing bank", "cambodia", "fintech"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-gray-50">
        <ErrorProvider>
          <AuthProvider>
            <ErrorBoundary>
              {children}
              <ErrorNotification />
            </ErrorBoundary>
          </AuthProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
