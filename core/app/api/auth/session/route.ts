import { auth } from "@/lib/auth";
import { ResponseFactory } from "@/types/response";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json(
      ResponseFactory.createErrorResponse<null>("UNAUTHORIZED", "No active session"),
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    ResponseFactory.createDataResponse(session, "Active session found"),
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
