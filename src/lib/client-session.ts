import { cookies } from "next/headers";
import { verifyClientSessionToken, type ClientSessionPayload } from "@/lib/client-auth";

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jocuts_client_session")?.value;
  if (!token) return null;

  try {
    return await verifyClientSessionToken(token);
  } catch {
    return null;
  }
}
