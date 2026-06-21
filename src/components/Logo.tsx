import ScissorsIcon from "./ScissorsIcon";

type LogoVariant = "header" | "hero" | "square" | "badge";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

function BrandName({ className }: { className?: string }) {
  return (
    <span className={`font-serif tracking-[0.02em] text-[var(--color-foreground)] ${className ?? ""}`}>
      JO&apos;Cuts
    </span>
  );
}

function BarbershopLine({
  className,
  titleCase = false,
}: {
  className?: string;
  titleCase?: boolean;
}) {
  return (
    <span
      className={`font-serif text-[var(--color-foreground)] ${
        titleCase ? "tracking-[0.14em]" : "uppercase tracking-[0.32em]"
      } ${className ?? ""}`}
    >
      Barbershop
    </span>
  );
}

function MartiniqueLine({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="h-px w-3 bg-[var(--color-foreground)]/70" aria-hidden="true" />
      <span className="font-sans text-[7px] font-medium uppercase tracking-[0.45em] text-[var(--color-foreground)]">
        Martinique
      </span>
      <span className="h-px w-3 bg-[var(--color-foreground)]/70" aria-hidden="true" />
    </div>
  );
}

export default function Logo({ variant = "header", className }: LogoProps) {
  if (variant === "hero") {
    return (
      <div className={`flex flex-col items-center text-center ${className ?? ""}`}>
        <ScissorsIcon className="mb-6 h-20 w-20 text-[var(--color-foreground)] md:mb-8 md:h-24 md:w-24" />
        <h1>
          <BrandName className="text-5xl md:text-7xl" />
        </h1>
        <BarbershopLine className="mt-3 block text-xs md:text-sm" />
      </div>
    );
  }

  if (variant === "square") {
    return (
      <div
        className={`flex flex-col items-center rounded-2xl border border-white/10 bg-[var(--color-surface)] px-10 py-12 text-center shadow-[0_0_40px_rgba(255,255,255,0.06)] ${className ?? ""}`}
      >
        <ScissorsIcon className="mb-5 h-14 w-14 text-[var(--color-foreground)]" />
        <BrandName className="text-3xl" />
        <BarbershopLine className="mt-2 block text-[10px]" />
        <span className="mt-3 font-sans text-[8px] font-medium uppercase tracking-[0.45em] text-[var(--color-foreground)]">
          Martinique
        </span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div
        className={`flex aspect-square w-40 flex-col items-center justify-center rounded-full border border-[var(--color-foreground)]/80 p-6 text-center ${className ?? ""}`}
      >
        <ScissorsIcon className="mb-3 h-10 w-10 text-[var(--color-foreground)]" />
        <BrandName className="text-xl" />
        <BarbershopLine className="mt-1 block text-[9px]" titleCase={true} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <ScissorsIcon className="h-9 w-9 shrink-0 text-[var(--color-foreground)]" />
      <div className="flex flex-col leading-none">
        <BrandName className="text-xl" />
        <BarbershopLine className="mt-1 block text-[10px]" />
        <MartiniqueLine className="mt-1.5" />
      </div>
    </div>
  );
}
