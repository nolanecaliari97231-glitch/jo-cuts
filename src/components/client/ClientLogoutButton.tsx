"use client";

import { useRouter } from "next/navigation";

export default function ClientLogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/client/logout", { method: "POST" });
        router.push("/compte/connexion");
        router.refresh();
      }}
      className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
    >
      Déconnexion
    </button>
  );
}
