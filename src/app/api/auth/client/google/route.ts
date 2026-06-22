import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/client-auth";

const STATE_COOKIE = "jocuts_google_state";

export async function GET(request: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL("/compte/connexion?error=google-config", request.url),
    );
  }

  const state = randomBytes(16).toString("hex");
  const next = request.nextUrl.searchParams.get("next") ?? "/compte";
  const authUrl = getGoogleAuthUrl(state, request.nextUrl.origin);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(STATE_COOKIE, `${state}:${next}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return response;
}
