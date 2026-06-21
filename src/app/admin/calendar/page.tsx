import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminCalendar, { getViewRange, type CalendarView } from "@/components/admin/AdminCalendar";
import AdminShell from "@/components/admin/AdminShell";
import {
  getAppointmentsForRange,
  getBlockedSlotsForRange,
  getWeeklySchedule,
} from "@/lib/availability-data";
import { parseDateParam } from "@/lib/schedule";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Calendrier",
  robots: { index: false, follow: false },
};

function parseView(value: string | undefined): CalendarView {
  if (value === "day" || value === "week" || value === "month") return value;
  return "week";
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const view = parseView(params.view);
  const date = parseDateParam(params.date);
  const { start, end } = getViewRange(view, date);

  const [schedules, appointments, blockedSlots] = await Promise.all([
    getWeeklySchedule(session.staffId),
    getAppointmentsForRange(session.staffId, start, end),
    getBlockedSlotsForRange(session.staffId, start, end),
  ]);

  return (
    <AdminShell
      title="Calendrier"
      description="Visualisez vos rendez-vous et indisponibilités. Cliquez sur un RDV pour le gérer."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/appointments?status=pending"
          className="inline-flex items-center rounded-sm border border-white/20 px-4 py-2 text-sm transition-colors hover:border-white/40"
        >
          Demandes en attente
        </Link>
      </div>

      <AdminCalendar
        view={view}
        date={date}
        appointments={appointments}
        blockedSlots={blockedSlots}
        schedules={schedules}
      />
    </AdminShell>
  );
}
