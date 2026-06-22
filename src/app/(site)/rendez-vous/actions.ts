"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBookingRequest, type BookingInput } from "@/lib/appointment-data";
import { getClientSession } from "@/lib/client-session";

function revalidateBookingPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/compte");
}

export async function submitBooking(input: Omit<BookingInput, "clientId">) {
  const session = await getClientSession();
  if (!session) {
    return { error: "Connectez-vous pour réserver un rendez-vous." };
  }

  const result = await createBookingRequest({ ...input, clientId: session.clientId });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateBookingPages();
  redirect(`/compte/rendez-vous/${result.appointmentId}`);
}
