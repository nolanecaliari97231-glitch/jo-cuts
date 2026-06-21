import Link from "next/link";
import { updateGalleryImage } from "@/app/admin/gallery/actions";

type GalleryEditFormProps = {
  imageId: string;
  defaultValues: {
    title: string;
    alt: string;
    focus: string;
  };
};

export default function GalleryEditForm({ imageId, defaultValues }: GalleryEditFormProps) {
  const formAction = updateGalleryImage.bind(null, imageId);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm text-[var(--color-muted)]">
          Titre affiché
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues.title}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="alt" className="block text-sm text-[var(--color-muted)]">
          Texte alternatif
        </label>
        <input
          id="alt"
          name="alt"
          type="text"
          defaultValue={defaultValues.alt}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="focus" className="block text-sm text-[var(--color-muted)]">
          Cadrage (object-position)
        </label>
        <input
          id="focus"
          name="focus"
          type="text"
          defaultValue={defaultValues.focus}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)]"
        >
          Enregistrer
        </button>
        <Link
          href="/admin/gallery"
          className="inline-flex items-center rounded-sm border border-white/20 px-5 py-2.5 text-sm hover:border-white/40"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}

const inputClassName =
  "mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/30";
