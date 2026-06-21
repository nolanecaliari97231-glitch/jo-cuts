import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BlockedSlotsPanel from "@/components/admin/BlockedSlotsPanel";
import AdminShell from "@/components/admin/AdminShell";
import WeeklyAvailabilityForm from "@/components/admin/WeeklyAvailabilityForm";
import { getUpcomingBlockedSlots, getWeeklySchedule } from "@/lib/availability-data";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Disponibilités",
  robots: { index: false, follow: false },
};

export default async function AdminAvailabilityPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [schedules, blockedSlots] = await Promise.all([
    getWeeklySchedule(session.staffId),
    getUpcomingBlockedSlots(session.staffId),
  ]);

  return (
    <AdminShell
      title="Disponibilités"
      description="Définissez vos horaires d'ouverture et bloquez des créneaux ponctuels. Ces réglages alimentent le calendrier public à venir."
    >
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/admin/calendar"
          className="inline-flex items-center rounded-sm border border-white/20 px-4 py-2 text-sm transition-colors hover:border-white/40"
        >
          Voir le calendrier
        </Link>
      </div>

      <section>
        <h2 className="font-serif text-xl">Horaires hebdomadaires</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Matin et après-midi avec pause déjeuner. Les horaires affichés sur le site public sont
          mis à jour automatiquement.
        </p>
        <div className="mt-6">
          <WeeklyAvailabilityForm schedules={schedules} />
        </div>
      </section>

      <section className="mt-14">
        <BlockedSlotsPanel slots={blockedSlots} />
      </section>
    </AdminShell>
  );
}
