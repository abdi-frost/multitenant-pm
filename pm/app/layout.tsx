import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "@/lib/env";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Management - Multi-Tenant PM SaaS",
  description: "Employee portal for project management",
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
              {children}
              <Toaster position="bottom-right" />
            </QueryProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}

