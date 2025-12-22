import { AdminTenantRepository } from "@/db/repositories";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const tenantId = (await params).id;

    const result = await AdminTenantRepository.getTenantById(tenantId);
    return NextResponse.json(result, { status: 200 });
}