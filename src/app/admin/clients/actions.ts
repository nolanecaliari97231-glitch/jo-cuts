"use server";

import { revalidatePath } from "next/cache";
import { clientBelongsToStaff, updateClientNotes } from "@/lib/client-data";
import { getSession } from "@/lib/session";

async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Non autorisé");
  }
  return session;
}

function revalidateClientPages(clientId: string) {
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
}

export async function saveClientNotes(clientId: string, formData: FormData) {
  const session = await requireSession();
  const belongs = await clientBelongsToStaff(session.staffId, clientId);

  if (!belongs) {
    return { error: "Client introuvable." };
  }

  const notes = String(formData.get("notes") ?? "");
  await updateClientNotes(clientId, notes);
  revalidateClientPages(clientId);

  return { ok: true as const };
}
