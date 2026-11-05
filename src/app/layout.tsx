import type { Metadata } from "next";
import { site, indexable, previewNoindex } from "@/lib/config";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  robots: { index: indexable, follow: !previewNoindex },
  openGraph: {
    title: site.name,
    description: site.description,
    locale: "en_AU",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
