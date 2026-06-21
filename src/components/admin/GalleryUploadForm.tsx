"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadGalleryImage } from "@/app/admin/gallery/actions";

export default function GalleryUploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await uploadGalleryImage(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
      className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6"
    >
      <h2 className="font-serif text-xl">Ajouter une photo</h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        JPG, PNG ou WebP — maximum 5 Mo. En production, les fichiers sont stockés sur Vercel Blob.
      </p>

      {error && (
        <p className="mt-4 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Image *">
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-1 block w-full text-sm text-[var(--color-muted)] file:mr-4 file:rounded-sm file:border-0 file:bg-[var(--color-foreground)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--color-background)]"
          />
        </Field>
        <Field label="Titre affiché *">
          <input
            name="title"
            type="text"
            required
            placeholder="Ex. Dégradé net"
            className={inputClassName}
          />
        </Field>
        <Field label="Texte alternatif (SEO / accessibilité)">
          <input
            name="alt"
            type="text"
            placeholder="Description courte de la photo"
            className={inputClassName}
          />
        </Field>
        <Field label="Cadrage CSS (object-position)">
          <input
            name="focus"
            type="text"
            defaultValue="50% 40%"
            placeholder="50% 40%"
            className={inputClassName}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] disabled:opacity-60"
      >
        {isPending ? "Envoi…" : "Ajouter à la galerie"}
      </button>
    </form>
  );
}

const inputClassName =
  "mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-white/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-[var(--color-muted)]">
      {label}
      {children}
    </label>
  );
}
