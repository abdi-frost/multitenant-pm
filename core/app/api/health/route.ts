import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

/**
 * Health Check Endpoint
 * 
 * Returns API status and database connectivity
 */
export async function GET() {
    try {
        // Check database connectivity
        const dbCheck = await db.execute("SELECT 1");
        
        return NextResponse.json({
            success: true,
            status: "healthy",
            timestamp: new Date().toISOString(),
            api: {
                name: "Multi-Tenant PM SaaS - Core API",
                version: "1.0.0",
                environment: process.env.NODE_ENV || "development"
            },
            services: {
                database: dbCheck ? "connected" : "disconnected",
                auth: "operational"
            },
            endpoints: {
                auth: "/api/auth",
                tenants: "/api/tenants",
                invitations: "/api/invitations",
                docs: "/"
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Health check failed:", error);
        
        return NextResponse.json({
            success: false,
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 503 });
    }
}
