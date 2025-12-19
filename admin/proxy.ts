import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth";
import { protectedRoutes } from "@/config/protected-routes";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Only enforce auth for protected routes
	const isProtected = protectedRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);
	if (!isProtected) {
		return NextResponse.next();
	}

	const cookie = getSessionCookie(request);

	if (!Boolean(cookie)) {
		// Redirect unauthenticated users to login with return path
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = "/login";
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

// Apply middleware to all protected routes and their nested paths
export const config = {
	// apply to all routes
	matcher: [
		/*
		* Match all request paths except for the ones starting with:
		* - api (API routes)
		* - _next/static (static files)
		* - _next/image (image optimization files)
		* - favicon.ico, sitemap.xml, robots.txt (metadata files)
		*/
		'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
};