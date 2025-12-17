import { AdminTenantRepository } from "@/db/repositories";
import { ResponseFactory } from "@/types";
import { NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/lib/api-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const tenantId = (await params).id;
    try {
        const user = await requireAuthFromRequest(request);
        const { reason } = await request.json();
        const result = await AdminTenantRepository.approveTenant(
            tenantId,
            user.id,
            reason || "Admin Approval"
        );
        return NextResponse.json(result, {
            status: 200,
        });
    } catch (error) {
        console.error("Error approving tenant:", error);
        return NextResponse.json(
            ResponseFactory.createErrorResponse("Failed to approve tenant"),
            { status: 500 }
        );
    }
}