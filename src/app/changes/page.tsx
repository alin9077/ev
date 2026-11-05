import ChangesView from "@/components/changes-view";
import { loadChangeMonths } from "@/lib/changes-data";
export const metadata = {
  title: "What changed: Australian EV prices and availability",
  description:
    "Month-by-month price moves, new arrivals and withdrawals for Australian electric cars, each with its source and check date.",
  alternates: { canonical: "/changes" },
};
export default function Changes() {
  return <ChangesView months={loadChangeMonths()} />;
}
