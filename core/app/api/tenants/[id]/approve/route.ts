import { approveTenant, RepositoryError } from "@/db/repositories/tenant.repository";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = (await params).id;
        console.log("]+[ Approving tenant with id:", id);
        const body = await request.json();
        // Expect { approvedBy: string, subscriptionTier?: string, maxEmployees?: number, maxProjects?: number }
        const { approvedBy, subscriptionTier, maxEmployees, maxProjects } = body;
        
        if (!approvedBy) {
            return NextResponse.json(
                { success: false, message: "approvedBy is required" }, 
                { status: 400 }
            );
        }
        
        const result = await approveTenant(id, approvedBy, subscriptionTier, maxEmployees, maxProjects);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in PATCH /api/tenants/[id]/approve:", error);
        if (error instanceof RepositoryError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({ success: false, message: "Error approving tenant", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}