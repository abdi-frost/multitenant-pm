import { NextRequest, NextResponse } from "next/server";
import { InvitationRepository } from "@/db/repositories";
import { RepositoryError } from "@/db/repositories/tenant.repository";
import { ResponseFactory } from "@/types/response";
import { EmployeeRole } from "@/types/entityEnums";
import { requireAuthFromRequest } from "@/lib/api-helpers";

function asEmployeeRole(value: unknown): EmployeeRole {
  const role = String(value ?? "").toUpperCase();
  if (role === EmployeeRole.STAFF) return EmployeeRole.STAFF;
  if (role === EmployeeRole.MANAGER) return EmployeeRole.MANAGER;
  if (role === EmployeeRole.ADMIN) return EmployeeRole.ADMIN;
  throw new RepositoryError("Invalid role", 400);
}

export async function GET(_request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const result = await InvitationRepository.getInvitationByToken(token);

    const safeInvitation = { ...result.invitation, tokenHash: undefined } as unknown;

    return NextResponse.json(
      ResponseFactory.createDataResponse(
        {
          invitation: safeInvitation,
          organizationName: result.organizationName,
        },
        "Invitation fetched"
      ),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error fetching invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error fetching invitation", String(error)), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user.tenantId) throw new RepositoryError("Tenant not configured", 400);

    await InvitationRepository.assertTenantAdmin({
      userId: user.id,
      tenantId: user.tenantId,
      userRole: user.role ?? null,
    });

    const { token: invitationId } = await ctx.params;
    const body = (await request.json()) as { role: EmployeeRole };
    const updated = await InvitationRepository.updateInvitationRole({
      tenantId: user.tenantId,
      invitationId,
      role: asEmployeeRole(body.role),
    });

    const safeInvitation = { ...updated, tokenHash: undefined } as unknown;
    return NextResponse.json(ResponseFactory.createDataResponse({ invitation: safeInvitation }, "Invitation updated"), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error updating invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error updating invitation", String(error)), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user.tenantId) throw new RepositoryError("Tenant not configured", 400);

    await InvitationRepository.assertTenantAdmin({
      userId: user.id,
      tenantId: user.tenantId,
      userRole: user.role ?? null,
    });

    const { token: invitationId } = await ctx.params;
    const revoked = await InvitationRepository.revokeInvitation({ tenantId: user.tenantId, invitationId });

    const safeInvitation = { ...revoked, tokenHash: undefined } as unknown;
    return NextResponse.json(ResponseFactory.createDataResponse({ invitation: safeInvitation }, "Invitation revoked"), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error revoking invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error revoking invitation", String(error)), { status: 500 });
  }
}
