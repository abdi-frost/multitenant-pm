import { rejectTenant, RepositoryError } from "@/db/repositories/tenant.repository";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = (await params).id;
        console.log("Rejecting tenant with id:", id);
        const body = await request.json();
        // Expect { rejectedBy: string, rejectionReason: string }
        const { rejectedBy, rejectionReason } = body;
        
        if (!rejectedBy || !rejectionReason) {
            return NextResponse.json(
                { success: false, message: "rejectedBy and rejectionReason are required" }, 
                { status: 400 }
            );
        }
        
        const result = await rejectTenant(id, rejectedBy, rejectionReason);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in PATCH /api/tenants/[id]/reject:", error);
        if (error instanceof RepositoryError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({ success: false, message: "Error rejecting tenant", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
