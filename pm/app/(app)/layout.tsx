import React from "react";

import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/providers/AuthProvider";

export default function AppGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
    );
}