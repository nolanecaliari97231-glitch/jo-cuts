import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";
import { CLIENT_SESSION_COOKIE } from "@/lib/client-auth";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function verifyStaffToken(token: string) {
  const secret = getAuthSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

async function verifyClientToken(token: string) {
  const secret = getAuthSecret();
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.kind === "client";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const staffToken = request.cookies.get(SESSION_COOKIE)?.value;
  const staffValid = staffToken ? await verifyStaffToken(staffToken) : false;

  if (pathname === "/admin/login") {
    if (staffValid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!staffValid) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      if (staffToken) {
        response.cookies.delete(SESSION_COOKIE);
      }
      return response;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/compte") && pathname !== "/compte/connexion") {
    const clientToken = request.cookies.get(CLIENT_SESSION_COOKIE)?.value;
    const clientValid = clientToken ? await verifyClientToken(clientToken) : false;
    if (!clientValid) {
      const loginUrl = new URL("/compte/connexion", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (clientToken) response.cookies.delete(CLIENT_SESSION_COOKIE);
      return response;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/rendez-vous")) {
    const clientToken = request.cookies.get(CLIENT_SESSION_COOKIE)?.value;
    const clientValid = clientToken ? await verifyClientToken(clientToken) : false;
    if (!clientValid) {
      const loginUrl = new URL("/compte/connexion", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/compte", "/compte/:path*", "/rendez-vous"],
};
