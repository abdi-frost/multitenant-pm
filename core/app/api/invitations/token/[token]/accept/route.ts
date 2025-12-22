import { NextRequest, NextResponse } from "next/server";
import { InvitationRepository } from "@/db/repositories";
import { RepositoryError } from "@/db/repositories/tenant.repository";
import { ResponseFactory } from "@/types/response";
import { getSessionFromRequest } from "@/lib/api-helpers";

type SessionUserShape = {
  id: string;
  email?: string | null;
  name?: string | null;
};

type AcceptBody =
  | { userId: string }
  | { email: string; password: string; name: string }
  | Record<string, never>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringField(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key];
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;

    const session = await getSessionFromRequest(request);
    const rawSessionUser = session?.user as unknown;
    const sessionUser: SessionUserShape | undefined =
      isObject(rawSessionUser) && typeof rawSessionUser.id === "string"
        ? {
            id: rawSessionUser.id,
            email: typeof rawSessionUser.email === "string" ? rawSessionUser.email : null,
            name: typeof rawSessionUser.name === "string" ? rawSessionUser.name : null,
          }
        : undefined;

    const bodyJson: unknown = await request.json().catch(() => ({}));
    const body: AcceptBody = (isObject(bodyJson) ? bodyJson : {}) as AcceptBody;

    const existingUserId = isObject(body) ? getStringField(body, "userId") : undefined;

    const signupEmail = isObject(body) ? getStringField(body, "email") : undefined;
    const signupPassword = isObject(body) ? getStringField(body, "password") : undefined;
    const signupName = isObject(body) ? getStringField(body, "name") : undefined;

    const signup = signupEmail && signupPassword && signupName ? { email: signupEmail, password: signupPassword, name: signupName } : undefined;

    const accepted = await InvitationRepository.acceptInvitation({
      token,
      existingUserId,
      signup,
      sessionUser,
    });

    const safeInvitation = accepted.invitation ? { ...accepted.invitation, tokenHash: undefined } : undefined;

    return NextResponse.json(
      ResponseFactory.createDataResponse(
        {
          invitation: safeInvitation,
          employee: accepted.employee,
          user: accepted.user,
        },
        "Invitation accepted"
      ),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error accepting invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error accepting invitation", String(error)), { status: 500 });
  }
}
