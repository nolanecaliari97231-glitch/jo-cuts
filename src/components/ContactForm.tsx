"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6">
        <p className="font-medium text-[var(--color-foreground)]">Message enregistré</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          L&apos;envoi automatique sera activé prochainement. En attendant, appelez le{" "}
          <a href="tel:+596696765606" className="underline underline-offset-4">
            0696 76 56 06
          </a>{" "}
          ou écrivez à{" "}
          <a href="mailto:237barber.contact@gmail.com" className="underline underline-offset-4">
            237barber.contact@gmail.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-sm border border-white/10 bg-[var(--color-surface)] p-6"
    >
      <div>
        <label htmlFor="name" className="block text-sm text-[var(--color-muted)]">
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/30"
          placeholder="Votre nom"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-[var(--color-muted)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/30"
          placeholder="votre@email.com"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm text-[var(--color-muted)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/30"
          placeholder="Votre message"
        />
      </div>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-sm bg-[var(--color-foreground)] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90"
      >
        Envoyer
      </button>
    </form>
  );
}
