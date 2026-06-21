interface PageIntroProps {
  title: string;
  description: string;
}

export default function PageIntro({ title, description }: PageIntroProps) {
  return (
    <div className="border-b border-white/10 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">{description}</p>
      </div>
    </div>
  );
}
