import { recoverTenant, RepositoryError } from "@/db/repositories/tenant.repository";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await recoverTenant(params.id);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in POST /api/tenants/[id]/recover:", error);
        if (error instanceof RepositoryError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({ success: false, message: "Error recovering tenant", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
