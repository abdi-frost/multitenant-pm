import { permanentlyDeleteTenant, RepositoryError } from "@/db/repositories/tenant.repository";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await permanentlyDeleteTenant(params.id);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in DELETE /api/tenants/[id]/hard-delete:", error);
        if (error instanceof RepositoryError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({ success: false, message: "Error permanently deleting tenant", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
