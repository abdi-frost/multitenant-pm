import { createTenant, getTenants, RepositoryError } from "@/db/repositories/tenant.repository";
import { CreateTenant } from "@/types/entityDTO";
import { ResponseFactory } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const requestData = await request.json() as CreateTenant;
        // TODO: Add validation for requestData
        const result = await createTenant(requestData);

        // success -> return created
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/tenants:", error);

        if (error instanceof RepositoryError) {
            // known repository-level error with status
            return NextResponse.json(ResponseFactory.createErrorResponse("Error creating tenant", error.message), { status: error.status });
        }

        return new NextResponse(JSON.stringify(ResponseFactory.createErrorResponse("Error creating tenant", error instanceof Error ? error.message : String(error))), { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") ? parseInt(searchParams.get("page") as string, 10) : 1;
        const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string, 10) : 20;
        const search = searchParams.get("search") || undefined;

        const result = await getTenants({ page, limit, search });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/tenants:", error);
        if (error instanceof RepositoryError) {
            // known repository-level error with status
            return NextResponse.json(ResponseFactory.createErrorResponse("Error fetching tenants", error.message), { status: error.status });
        }
        return new NextResponse(JSON.stringify(ResponseFactory.createErrorResponse("Error fetching tenants", error instanceof Error ? error.message : String(error))), { status: 500 });
    }
}