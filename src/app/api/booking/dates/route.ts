import { NextResponse } from "next/server";
import { getBookableDates } from "@/lib/appointment-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return NextResponse.json({ error: "Service requis." }, { status: 400 });
  }

  const dates = await getBookableDates(serviceId);
  return NextResponse.json({ dates });
}
