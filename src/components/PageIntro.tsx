interface PageIntroProps {
  title: string;
  description: string;
}

export default function PageIntro({ title, description }: PageIntroProps) {
  return (
    <div className="border-b border-white/10 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">{description}</p>
      </div>
    </div>
  );
}
