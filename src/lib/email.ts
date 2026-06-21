type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult =
  | { ok: true; id?: string; dev?: boolean }
  | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const recipients = (Array.isArray(input.to) ? input.to : [input.to]).filter(Boolean);
  if (recipients.length === 0) {
    return { ok: false, error: "Aucun destinataire." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "JO'Cuts <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[jocuts:email:dev]", {
      to: recipients,
      subject: input.subject,
      text: input.text ?? stripHtml(input.html),
    });
    return { ok: true, dev: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: body || "Erreur d'envoi email." };
    }

    const data = (await response.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur d'envoi email.",
    };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatEuro(amount: number): string {
  return Number.isInteger(amount) ? `${amount} €` : `${amount.toFixed(2)} €`;
}
