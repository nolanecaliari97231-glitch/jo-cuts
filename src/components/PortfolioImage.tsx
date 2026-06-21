/** Point de focus par défaut — visage / coupe dans le haut du portrait. */
export const DEFAULT_PHOTO_FOCUS = "50% 38%";

type PortfolioImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  focus?: string;
};

export default function PortfolioImage({
  src,
  alt,
  className = "",
  priority = false,
  focus = DEFAULT_PHOTO_FOCUS,
}: PortfolioImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      style={{ objectPosition: focus }}
    />
  );
}
