import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/sign-out
 * 
 * Logs out the current user by terminating their session.
 * This endpoint uses Better Auth to handle session cleanup.
 * 
 * Request:
 * - No body required
 * - Session cookie must be present
 * 
 * Response:
 * - 200: Successfully logged out
 * - 401: No active session
 * 
 * Usage:
 * - Both Admin Panel and PM App should call this endpoint
 * - Clear any local storage/state after successful logout
 * - Redirect to login page after logout
 */
export async function POST(request: NextRequest) {
  return await auth.handler(request);
}
