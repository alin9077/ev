import { catalogue, pack } from "./data";
import { BASELINE } from "./config";
import { makeReport } from "./citable";

// Explicit, stable URLs and trims: a future price change must not silently change the cars on a page.
export const pairPages = [
  { slug: "model-y-vs-sealion-7", rival: "byd_sealion_7__premium_rwd__1" },
  {
    slug: "model-y-vs-geely-ex5",
    rival: "geely_ex5__complete_extended_range__1",
  },
  { slug: "model-y-vs-zeekr-7x", rival: "zeekr_7x__rwd__1" },
  { slug: "model-y-vs-jaecoo-j5", rival: "jaecoo_j5_ev__ev_summit__1" },
  { slug: "model-y-vs-atto-2", rival: "byd_atto_2__dynamic__1" },
  { slug: "model-y-vs-model-3", rival: "tesla_model_3__rear_wheel_drive__3" },
  { slug: "model-y-vs-kia-ev5", rival: "kia_ev5__air_2wd_standard_range__1" },
  { slug: "model-y-vs-kia-ev3", rival: "kia_ev3__air_2wd_standard_range__1" },
  { slug: "model-y-vs-atto-3", rival: "byd_atto_3_evo__dynamic_fwd__1" },
];
export function pairReport(slug: string) {
  const pair = pairPages.find((p) => p.slug === slug);
  return pair
    ? makeReport([pack(BASELINE), pack(pair.rival)], `/compare/${pair.slug}`)
    : undefined;
}
export function pairLinks() {
  return pairPages.map((p) => {
    const car = catalogue().find((c) => c.id === p.rival)!;
    return {
      ...p,
      href: `/compare/${p.slug}`,
      label: `Model Y vs ${car.brand === "Tesla" ? "" : `${car.brand} `}${car.model}`,
      car,
    };
  });
}
