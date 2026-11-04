import { catalogue, publicPack } from "@/lib/data";
/**
 * One variant's public pack (unverified facts already withheld), fetched by the comparison pages as the
 * reader moves along the fleet, so a page ships only the cars in view.
 */
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return catalogue().map((c) => ({ id: c.id }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return catalogue().some((c) => c.id === id)
    ? Response.json(publicPack(id))
    : Response.json({ error: "Variant not found" }, { status: 404 });
}
