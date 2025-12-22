import { NextRequest, NextResponse } from "next/server";
import { InvitationRepository } from "@/db/repositories";
import { RepositoryError } from "@/db/repositories/tenant.repository";
import { ResponseFactory } from "@/types/response";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const result = await InvitationRepository.validateToken(token);
    return NextResponse.json(ResponseFactory.createDataResponse(result, "Invitation token validated"), { status: 200 });
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error validating token", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error validating token", String(error)), { status: 500 });
  }
}
