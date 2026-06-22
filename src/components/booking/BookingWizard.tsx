"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { submitBooking } from "@/app/(site)/rendez-vous/actions";
import BookingDateCalendar from "@/components/booking/BookingDateCalendar";
import BookingTimeSlots from "@/components/booking/BookingTimeSlots";
import type { BookingServiceOption } from "@/lib/appointment-data";
import { salon } from "@/lib/salon";
import { formatLongDate, formatTimeDisplay } from "@/lib/schedule";

type LocationMode = "at_barber" | "at_home";

type BookingWizardProps = {
  services: BookingServiceOption[];
  profile: {
    name: string;
    email: string;
    phone: string;
  };
};

const STEPS = ["Service", "Lieu", "Créneau", "Coordonnées"] as const;

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `${price} €` : `${price.toFixed(2)} €`;
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return formatLongDate(new Date(year, month - 1, day));
}

export default function BookingWizard({ services, profile }: BookingWizardProps) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("at_barber");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookableDates, setBookableDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState(profile.name);
  const [clientPhone, setClientPhone] = useState(profile.phone);
  const [commune, setCommune] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [services, serviceId],
  );

  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setLoadingDates(true);
      setBookableDates([]);
      setDate("");
      setTime("");
      setSlots([]);
    });

    fetch(`/api/booking/dates?serviceId=${serviceId}`)
      .then((response) => response.json())
      .then((data: { dates?: string[] }) => {
        if (!cancelled) setBookableDates(data.dates ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les dates disponibles.");
      })
      .finally(() => {
        if (!cancelled) setLoadingDates(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId || !date) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setLoadingSlots(true);
      setTime("");
      setSlots([]);
    });

    fetch(`/api/booking/slots?serviceId=${serviceId}&date=${date}`)
      .then((response) => response.json())
      .then((data: { slots?: string[] }) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les créneaux.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, date]);

  function goNext() {
    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleSubmit() {
    if (!selectedService || !date || !time) return;

    setError(null);
    startTransition(async () => {
      const result = await submitBooking({
        serviceId,
        date,
        time,
        locationMode,
        commune: locationMode === "at_home" ? commune : undefined,
        paymentMethod,
        clientName,
        clientPhone,
        notes: notes || undefined,
      });

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (services.length === 0) {
    return (
      <div className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        Aucun service disponible pour le moment. Revenez plus tard ou contactez le barbier.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ol className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`shrink-0 rounded-sm px-3 py-2 text-xs uppercase tracking-wider sm:py-1.5 ${
              index === step
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : index < step
                  ? "border border-white/20 text-[var(--color-foreground)]"
                  : "border border-white/10 text-[var(--color-muted)]"
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {step === 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl">Choisissez votre prestation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setServiceId(service.id)}
                className={`rounded-sm border p-5 text-left transition-colors min-h-[44px] ${
                  serviceId === service.id
                    ? "border-[var(--color-foreground)] bg-[var(--color-surface)]"
                    : "border-white/10 bg-[var(--color-surface)] hover:border-white/25"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                      {service.category}
                    </p>
                    <h3 className="mt-1 font-medium">{service.name}</h3>
                  </div>
                  <span className="shrink-0 font-serif text-lg">{formatPrice(service.price)}</span>
                </div>
                {service.description && (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{service.description}</p>
                )}
                <p className="mt-3 text-xs text-[var(--color-muted)]">{service.durationMinutes} min</p>
              </button>
            ))}
          </div>
          <WizardNav
            canContinue={Boolean(serviceId)}
            onContinue={goNext}
            continueLabel="Continuer"
          />
        </section>
      )}

      {step === 1 && selectedService && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl">Où souhaitez-vous être coiffé ?</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                { id: "at_barber" as const, ...salon.appointmentModes.atBarber },
                { id: "at_home" as const, ...salon.appointmentModes.atHome },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setLocationMode(mode.id)}
                className={`rounded-sm border p-5 text-left transition-colors min-h-[44px] ${
                  locationMode === mode.id
                    ? "border-[var(--color-foreground)] bg-[var(--color-surface)]"
                    : "border-white/10 bg-[var(--color-surface)] hover:border-white/25"
                }`}
              >
                <h3 className="font-medium">{mode.label}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{mode.description}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted)]">{salon.locationPolicy}</p>
          <WizardNav onBack={goBack} canContinue onContinue={goNext} continueLabel="Continuer" />
        </section>
      )}

      {step === 2 && selectedService && (
        <section className="space-y-6">
          <h2 className="font-serif text-2xl">Choisissez un créneau</h2>
          <p className="text-sm text-[var(--color-muted)]">
            {selectedService.name} — créneaux par intervalles de 30 minutes.{" "}
            {salon.appointmentTimingNote}
          </p>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
              Date
            </h3>
            {loadingDates ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">Chargement des dates…</p>
            ) : bookableDates.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Aucune date disponible pour cette prestation. Essayez un autre service.
              </p>
            ) : (
              <BookingDateCalendar
                key={serviceId}
                bookableDates={bookableDates}
                selectedDate={date}
                onSelect={setDate}
              />
            )}
          </div>

          {date && (
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
                Heure
              </h3>
              {loadingSlots ? (
                <p className="mt-3 text-sm text-[var(--color-muted)]">Chargement des horaires…</p>
              ) : slots.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  Aucun créneau disponible ce jour-là.
                </p>
              ) : (
                <BookingTimeSlots slots={slots} selectedTime={time} onSelect={setTime} />
              )}
            </div>
          )}

          <WizardNav
            onBack={goBack}
            canContinue={Boolean(date && time)}
            onContinue={goNext}
            continueLabel="Continuer"
          />
        </section>
      )}

      {step === 3 && selectedService && date && time && (
        <section className="space-y-6">
          <h2 className="font-serif text-2xl">Vos coordonnées</h2>

          <div className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-5 text-sm">
            <p className="font-medium">{selectedService.name}</p>
            <p className="mt-1 text-[var(--color-muted)]">
              {formatDateLabel(date)} à {formatTimeDisplay(time)} —{" "}
              {locationMode === "at_barber" ? "Chez le barbier" : "À domicile"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom complet" required>
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
                className={inputClassName}
                placeholder="Votre nom"
              />
            </Field>
            <Field label="Téléphone" required>
              <input
                value={clientPhone}
                onChange={(event) => setClientPhone(event.target.value)}
                required
                type="tel"
                className={inputClassName}
                placeholder="0696 00 00 00"
              />
            </Field>
            <Field label="Email (compte)" className="md:col-span-2">
              <input
                value={profile.email}
                readOnly
                className={`${inputClassName} cursor-not-allowed opacity-70`}
              />
            </Field>
            {locationMode === "at_home" && (
              <Field label="Commune" required className="md:col-span-2">
                <input
                  value={commune}
                  onChange={(event) => setCommune(event.target.value)}
                  required
                  className={inputClassName}
                  placeholder="Ex. Fort-de-France, Schoelcher…"
                />
              </Field>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
              Paiement prévu
            </h3>
            <div className="mt-3 space-y-2">
              {salon.paymentMethods
                .filter((method) => method.available)
                .map((method) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-start gap-3 rounded-sm border border-white/10 bg-[var(--color-surface)] p-4"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{method.label}</span>
                      <span className="mt-1 block text-sm text-[var(--color-muted)]">
                        {method.description}
                      </span>
                    </span>
                  </label>
                ))}
            </div>
          </div>

          <Field label="Message pour le barbier (optionnel)">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className={inputClassName}
              placeholder="Précisions sur la coupe, allergies, accès domicile…"
            />
          </Field>

          <p className="text-xs text-[var(--color-muted)]">
            Votre demande sera envoyée en statut « en attente ». Le barbier vous confirmera dans
            votre espace compte — adresse et messages disponibles dès validation.
          </p>

          <WizardNav
            onBack={goBack}
            canContinue={
              clientName.trim().length > 0 &&
              clientPhone.trim().length > 0 &&
              (locationMode !== "at_home" || commune.trim().length > 0)
            }
            onContinue={handleSubmit}
            continueLabel={isPending ? "Envoi…" : "Envoyer la demande"}
            pending={isPending}
          />
        </section>
      )}
    </div>
  );
}

const inputClassName =
  "mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-3 text-base outline-none focus:border-white/30 sm:py-2 sm:text-sm";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm text-[var(--color-muted)]">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

function WizardNav({
  onBack,
  onContinue,
  canContinue,
  continueLabel,
  pending = false,
}: {
  onBack?: () => void;
  onContinue: () => void;
  canContinue: boolean;
  continueLabel: string;
  pending?: boolean;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-white/10 bg-[var(--color-background)]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:pt-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 w-full rounded-sm border border-white/20 px-5 py-2.5 text-sm transition-colors hover:border-white/40 sm:w-auto"
        >
          Retour
        </button>
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue || pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {continueLabel}
      </button>
    </div>
  );
}
