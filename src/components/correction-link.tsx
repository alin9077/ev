import { correctionMailto } from "@/lib/correction-contact";

/**
 * Renders a correction `mailto:` link only when NEXT_PUBLIC_CORRECTION_EMAIL
 * is set to a valid address. The variable is read at render time (and inlined
 * at build time by Next.js). Nothing is rendered otherwise.
 */
export default function CorrectionLink({
  intro = "Send a correction to",
}: {
  intro?: string;
}) {
  const contact = correctionMailto(process.env.NEXT_PUBLIC_CORRECTION_EMAIL);
  if (!contact) return null;
  return (
    <p className="correction-contact">
      {intro} <a href={contact.href}>{contact.email}</a>. Please name the exact
      variant, the claim and the original source.
    </p>
  );
}
