import { SignJWT, jwtVerify } from "jose";

export const CLIENT_SESSION_COOKIE = "jocuts_client_session";
const CLIENT_SESSION_DURATION = "30d";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET manquant dans .env");
  }
  return new TextEncoder().encode(secret);
}

export type ClientSessionPayload = {
  kind: "client";
  clientId: string;
  email: string;
  name: string;
};

export async function createClientSessionToken(payload: Omit<ClientSessionPayload, "kind">) {
  return new SignJWT({ ...payload, kind: "client" satisfies ClientSessionPayload["kind"] })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(CLIENT_SESSION_DURATION)
    .setIssuedAt()
    .sign(getAuthSecret());
}

export async function verifyClientSessionToken(token: string): Promise<ClientSessionPayload> {
  const { payload } = await jwtVerify(token, getAuthSecret());
  const session = payload as ClientSessionPayload;
  if (session.kind !== "client") {
    throw new Error("Session client invalide.");
  }
  return session;
}

/** URL publique du site — préfère l'origine réelle de la requête (évite les typos dans .env). */
export function getSiteUrl(requestOrigin?: string): string {
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, "");
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // NEXT_PUBLIC_SITE_URL invalide (ex. apostrophe dans le hostname)
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export function getGoogleRedirectUri(requestOrigin?: string): string {
  return `${getSiteUrl(requestOrigin)}/api/auth/client/google/callback`;
}

export function getGoogleAuthUrl(state: string, requestOrigin?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID manquant.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(requestOrigin),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

export async function exchangeGoogleCode(
  code: string,
  requestOrigin?: string,
): Promise<GoogleUserInfo> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Configuration Google OAuth incomplète.");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(requestOrigin),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Échec de l'authentification Google.");
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error("Token Google manquant.");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileResponse.ok) {
    throw new Error("Profil Google inaccessible.");
  }

  const profile = (await profileResponse.json()) as GoogleUserInfo;
  if (!profile.email) {
    throw new Error("Email Google requis.");
  }

  return profile;
}
