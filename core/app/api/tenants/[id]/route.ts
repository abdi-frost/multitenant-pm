/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTenantById, approveTenant, deleteTenant, RepositoryError, permanentlyDeleteTenant } from "@/db/repositories/tenant.repository";
import { DeleteType } from "@/types/entityEnums";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await getTenantById(params.id);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in GET /api/tenants/[id]:", error);
        if (error instanceof RepositoryError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({ success: false, message: "Error fetching tenant", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        // Expect { approvedBy?: string }
        const approvedBy = body?.approvedBy;
        const resolvedParams = await params;

        if (!resolvedParams || !resolvedParams.id) {
            console.error('PATCH missing params.id — request.url=', request.url, 'nextUrl=', request.nextUrl?.href, 'body=', body);
            return NextResponse.json({ success: false, message: 'Missing tenant id in URL' }, { status: 400 });
        }

        const result = await approveTenant(resolvedParams.id, approvedBy);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in PATCH /api/tenants/[id]:", error);
        if (error instanceof RepositoryError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({ success: false, message: "Error updating tenant", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const deleteType = await request.json() as DeleteType;
        let result;
        if (deleteType === DeleteType.SOFT) {
            result = await deleteTenant(params.id);
        } else {
            result = await permanentlyDeleteTenant(params.id);
        }
        // return 200 with message
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in DELETE /api/tenants/[id]:", error);
        if (error instanceof RepositoryError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({ success: false, message: "Error deleting tenant", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
