export default function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="14" cy="34" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="14" cy="14" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M18 30L40 8M18 18L40 40"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}
