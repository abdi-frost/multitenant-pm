import { NextRequest, NextResponse } from "next/server";
import { InvitationRepository } from "@/db/repositories";
import { RepositoryError } from "@/db/repositories/tenant.repository";
import { ResponseFactory } from "@/types/response";
import { requireAuthFromRequest } from "@/lib/api-helpers";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user.tenantId) throw new RepositoryError("Tenant not configured", 400);

    await InvitationRepository.assertTenantAdmin({
      userId: user.id,
      tenantId: user.tenantId,
      userRole: user.role ?? null,
    });

    const { id } = await ctx.params;
    const invitation = await InvitationRepository.getInvitationById(id);

    if (invitation.tenantId !== user.tenantId) {
      throw new RepositoryError("Forbidden", 403);
    }

    const safeInvitation = { ...invitation, tokenHash: undefined } as unknown;
    return NextResponse.json(ResponseFactory.createDataResponse({ invitation: safeInvitation }, "Invitation fetched"), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error fetching invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error fetching invitation", String(error)), { status: 500 });
  }
}
