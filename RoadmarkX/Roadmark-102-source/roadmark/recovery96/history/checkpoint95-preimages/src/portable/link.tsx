import type { ComponentProps } from "react";
import { localUrl, navigate } from "./navigation";
export default function Link({
  href,
  onClick,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  return (
    <a
      {...props}
      href={localUrl(href)}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          !href.startsWith("/") ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
