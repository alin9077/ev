import { createRoot } from "react-dom/client";
import { SiteShell } from "@/components/site-shell";
import Experience from "@/components/experience";
import FleetExperience from "@/components/fleet-experience";
import { fleetSelection } from "@/lib/fleet";
import Explorer from "@/components/explorer";
import Detail from "@/components/detail";
import Software from "@/components/software";
import SourceRegistry from "@/components/source-registry";
import ModelY from "@/app/model-y/page";
import Methodology from "@/app/methodology/page";
import { research, pickerCatalogue, catalogue, pack, counts } from "./data";
import { parseSelection } from "@/lib/compare";
import { BASELINE } from "@/lib/config";
import { useLocation } from "./navigation";
/** The B build sets this before the bundle runs: the same page, with the B scenes. */
const B = (window as unknown as { __EV_B?: boolean }).__EV_B;
function App() {
  const query = new URLSearchParams(useLocation()),
    path = query.get("page") || "/";
  const cars = pickerCatalogue(),
    d = research();
  const state = parseSelection(query, cars);
  let content;
  if (path === "/cars") {
    const equipment = Object.fromEntries(
      d.trim_equipment.map((e) => [
        e.variant_id,
        Object.fromEntries(
          [
            "front_ventilated",
            "hud",
            "adaptive_damping",
            "power_roof_shade",
          ].map((k) => [k, typeof e[k] === "boolean" ? e[k] : null]),
        ),
      ]),
    );
    content = (
      <Explorer
        cars={cars}
        initial={Object.fromEntries(query)}
        equipment={equipment}
      />
    );
  } else if (path.startsWith("/cars/")) {
    const car = catalogue().find((c) => path === `/cars/${c.family}/${c.slug}`);
    content = car ? (
      <Detail pack={pack(car.id)} criteria={d.criteria} />
    ) : (
      <main id="main" className="container editorial-page">
        <h1>Car not found</h1>
      </main>
    );
  } else if (path === "/model-y") content = <ModelY />;
  else if (path === "/methodology") content = <Methodology />;
  else if (path === "/software")
    content = (
      <Software
        cars={cars}
        pack={pack(query.get("car") || "") || pack(BASELINE)}
      />
    );
  else if (path === "/sources")
    content = (
      <main id="main" className="container editorial-page">
        <h1>Sources</h1>
        <SourceRegistry sources={d.sources} />
      </main>
    );
  else if (!path.startsWith("/compare"))
    content = (
      <FleetExperience
        allPacks={catalogue().map((c) => pack(c.id))}
        initial={fleetSelection(catalogue(), query)}
        criteria={d.criteria}
        version={B ? "b" : undefined}
      />
    );
  else
    content = (
      <Experience
        cars={cars}
        packs={state.ids.map(pack)}
        state={state}
        criteria={d.criteria}
        counts={counts()}
        mode={path.startsWith("/compare") ? "compare" : "home"}
      />
    );
  return (
    <SiteShell sources={d.sources}>
      <div key={path}>{content}</div>
    </SiteShell>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
