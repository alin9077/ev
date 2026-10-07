/* Portable export uses the same rights gate; approved paths remain local. */
import type { ComponentProps } from "react";
export default function Image({ src, alt, ...props }: ComponentProps<"img">) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={src} alt={alt || ""} />;
}
