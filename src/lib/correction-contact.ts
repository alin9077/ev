/**
 * Build a `mailto:` link for the correction contact, or null when none is
 * configured. A missing or malformed address yields null so the page shows no
 * link at all rather than a fake or broken one.
 */
export function correctionMailto(value: string | undefined | null) {
  const email = (value ?? "").trim();
  // One address only: no whitespace, commas, semicolons, angle brackets or
  // extra "@", and a dotted domain. This also blocks header injection
  // (e.g. "a@b.c?cc=x@y.z").
  if (
    !/^[^\s@,;<>?&"'()[\]\\]+@[^\s@,;<>?&"'()[\]\\]+\.[^\s@,;<>?&"'()[\]\\.]+$/.test(
      email,
    )
  )
    return null;
  return { email, href: `mailto:${email}` };
}
