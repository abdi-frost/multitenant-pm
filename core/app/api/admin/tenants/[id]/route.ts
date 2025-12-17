import { AdminTenantRepository, RepositoryError } from "@/db/repositories";
import { ResponseFactory } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const tenantId = (await params).id;
    console.log("Fetching tenant with ID:", tenantId);
    try {
        const result = await AdminTenantRepository.getTenantById(tenantId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/tenants/:id:", error);
        if (error instanceof RepositoryError) {
            // known repository-level error with status
            return NextResponse.json(
                ResponseFactory.createErrorResponse("Error fetching tenant", error.message), { status: error.status }
            );
        }
        return new NextResponse(JSON.stringify(
            ResponseFactory.createErrorResponse("Error fetching tenant", error instanceof Error ? error.message : String(error))), { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const tenantId = (await params).id;
    try {
        const result = await AdminTenantRepository.deleteTenant(tenantId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error deleting tenant in route api/admin/tenants/[id]/delete:", error);
        return NextResponse.json(ResponseFactory.createErrorResponse("Failed to delete tenant"), { status: 500 });
    }
}