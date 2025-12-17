// app/api/admin/tenants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ResponseFactory, type AdminCreateTenantDTO } from "@/types";
import { AdminTenantRepository, RepositoryError } from "@/db/repositories/tenant.repository";

export async function POST(request: NextRequest) {

    try {
        const body: AdminCreateTenantDTO = await request.json();
        console.log({ body })
        if (!body.tenant || !body.organization || !body.user) {
            return NextResponse.json(
                { error: "Missing required tenant, organization, or user data" },
                { status: 400 }
            );
        }

        const result = await AdminTenantRepository.createTenant(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/admin/tenants:", error);

        if (error instanceof RepositoryError) {
            return NextResponse.json(ResponseFactory.createErrorResponse(error.message), { status: 400 });
        }

        return NextResponse.json(ResponseFactory.createErrorResponse(
            "Internal Server Error",
            error instanceof Error ? error.message : undefined
        ), { status: 500 });
    }
}


export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const page = url.searchParams.get("page");
        const limit = url.searchParams.get("limit");
        const search = url.searchParams.get("search");

        const tenants = await AdminTenantRepository.getTenants({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search ?? undefined,
        });
        return NextResponse.json(tenants, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/admin/tenants:", error);
        return NextResponse.json(ResponseFactory.createErrorResponse(
            "Internal Server Error",
            error instanceof Error ? error.message : undefined
        ), { status: 500 });
    }
}