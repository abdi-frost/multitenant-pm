import { NextRequest, NextResponse } from "next/server";
import { InvitationRepository } from "@/db/repositories";
import { RepositoryError } from "@/db/repositories/tenant.repository";
import { ResponseFactory } from "@/types/response";
import { requireAuthFromRequest } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user.tenantId) throw new RepositoryError("Tenant not configured", 400);

    await InvitationRepository.assertTenantAdmin({
      userId: user.id,
      tenantId: user.tenantId,
      userRole: user.role ?? null,
    });

    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    if (!email) throw new RepositoryError("email is required", 400);

    const result = await InvitationRepository.checkEmailInvited({ tenantId: user.tenantId, email });
    return NextResponse.json(ResponseFactory.createDataResponse(result, "Invitation check complete"), { status: 200 });
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error checking invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error checking invitation", String(error)), { status: 500 });
  }
}
