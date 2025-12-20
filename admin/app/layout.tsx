import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "@/lib/env";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Panel - Multi-Tenant PM SaaS",
  description: "Super admin dashboard for tenant management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster position="bottom-right" closeButton />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
