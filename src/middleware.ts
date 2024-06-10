import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";

import {
	DEFAULT_LOGIN_REDIRECT,
	apiAuthPrefix,
	authRoutes,
	publicRoutes,
} from "../routes"

export async function middleware(req: NextRequest) {
	const token = await getToken({ req });
	const { nextUrl } = req;
	const isLoggedIn = !!token;

	console.log(token, nextUrl, isLoggedIn)

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) return NextResponse.next();

	if (isAuthRoute) {
		if (isLoggedIn)
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
		return NextResponse.next();
	}

	if (!isLoggedIn && !isPublicRoute)
		return Response.redirect(new URL("/auth/sign-in", nextUrl));

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
		"/((?!.*\\..*|_next).*)",
		"/",
		"/(api|trpc)(.*)",
	],
};
