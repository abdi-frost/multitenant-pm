import { NextRequest, NextResponse } from "next/server";
import { InvitationRepository } from "@/db/repositories";
import { RepositoryError } from "@/db/repositories/tenant.repository";
import { ResponseFactory } from "@/types/response";
import { requireAuthFromRequest } from "@/lib/api-helpers";
import { emailService } from "@/lib/email.service";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user.tenantId) throw new RepositoryError("Tenant not configured", 400);

    await InvitationRepository.assertTenantAdmin({
      userId: user.id,
      tenantId: user.tenantId,
      userRole: user.role ?? null,
    });

    const { id } = await ctx.params;

    const { invitation, token } = await InvitationRepository.resendInvitation({ tenantId: user.tenantId, invitationId: id });

    const invitationUrlBase = process.env.PM_APP_URL || "http://localhost:3001";
    const invitationUrl = `${invitationUrlBase.replace(/\/$/, "")}/accept-invite?token=${token}`;

    await emailService.sendInvitationEmail(invitation.email, {
      inviteeName: [invitation.firstName, invitation.lastName].filter(Boolean).join(" ") || invitation.email,
      inviterName: user.name,
      organizationName: user.tenantId,
      role: String(invitation.role),
      invitationUrl,
      expiresAt: new Date(invitation.expiresAt),
    });

    const safeInvitation = { ...invitation, tokenHash: undefined } as unknown;

    return NextResponse.json(
      ResponseFactory.createDataResponse({ invitation: safeInvitation, token, invitationUrl }, "Invitation resent"),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error resending invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error resending invitation", String(error)), { status: 500 });
  }
}
