import MarketAudit from "@/components/market-audit";
export const metadata = {
  title: "Australian EV market coverage",
  alternates: { canonical: "/market" },
};
export default function MarketPage() {
  return <MarketAudit />;
}
