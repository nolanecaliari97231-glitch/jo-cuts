import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_SESSION_COOKIE,
  createClientSessionToken,
  exchangeGoogleCode,
} from "@/lib/client-auth";
import { upsertClientFromGoogle } from "@/lib/client-portal";

const STATE_COOKIE = "jocuts_google_state";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !stateCookie) {
    return NextResponse.redirect(new URL("/compte/connexion?error=google", request.url));
  }

  const [expectedState, nextPath] = stateCookie.split(":");
  if (state !== expectedState) {
    return NextResponse.redirect(new URL("/compte/connexion?error=state", request.url));
  }

  try {
    const profile = await exchangeGoogleCode(code, request.nextUrl.origin);
    const client = await upsertClientFromGoogle({
      googleId: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const token = await createClientSessionToken({
      clientId: client.id,
      email: client.email ?? profile.email,
      name: client.name,
    });

    const redirectTo = nextPath?.startsWith("/") ? nextPath : "/compte";
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    response.cookies.set(CLIENT_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/compte/connexion?error=google", request.url));
  }
}
