import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/appointment-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const slots = await getAvailableSlots(serviceId, date);
  return NextResponse.json(
    { slots },
    { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } },
  );
}
