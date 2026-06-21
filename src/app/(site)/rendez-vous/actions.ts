"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBookingRequest, type BookingInput } from "@/lib/appointment-data";

function revalidateBookingPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
}

export async function submitBooking(input: BookingInput) {
  const result = await createBookingRequest(input);

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateBookingPages();
  redirect(`/rendez-vous/confirmation?id=${result.appointmentId}`);
}
