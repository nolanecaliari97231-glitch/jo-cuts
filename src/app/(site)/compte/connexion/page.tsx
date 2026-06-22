import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/client/GoogleSignInButton";
import PageIntro from "@/components/PageIntro";
import { getClientSession } from "@/lib/client-session";

export const metadata: Metadata = {
  title: "Connexion client",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  google: "Connexion Google impossible. Réessayez.",
  "google-config": "Connexion Google non configurée sur le serveur.",
  state: "Session expirée. Recommencez la connexion.",
};

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await getClientSession();
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/compte";

  if (session) {
    redirect(nextPath);
  }

  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <>
      <PageIntro
        title="Mon compte"
        description="Connectez-vous pour réserver un rendez-vous et suivre vos demandes, confirmations et messages du barbier."
      />

      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
        {errorMessage && (
          <div className="mb-6 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        )}

        <div className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6">
          <GoogleSignInButton nextPath={nextPath} />
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Connexion requise avant de prendre rendez-vous. Vous retrouverez vos RDV, l&apos;adresse
            après validation et les messages du barbier ici.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          <Link href="/" className="underline underline-offset-4 hover:text-[var(--color-foreground)]">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </>
  );
}
