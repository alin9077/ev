import { useEffect, useRef, type MouseEvent } from "react";
import { RoadmarkLogo } from "./roadmark-logo";
import {
  VerdictPictogram,
  type VerdictPictogramName,
} from "./verdict-pictogram";

const reasons: {
  title: string;
  icon: VerdictPictogramName;
  target: string;
  copy: string;
}[] = [
  {
    title: "Full Self-Driving (Supervised)",
    icon: "wheel",
    target: "detail-adas_optional",
    copy: "Our standout feature: optional Tesla-only assistance, with active driver supervision.",
  },
  {
    title: "Grok & software updates",
    icon: "updates",
    target: "chapter-07",
    copy: "Grok AI and 15+ documented releases, Oct 2024–Oct 2026. Hardware eligibility applies.",
  },
  {
    title: "Award-winning safety",
    icon: "safety",
    target: "detail-safety_ancap",
    copy: "Euro NCAP’s 2025 Best in Class Small SUV. Check Australian variant coverage below.",
  },
  {
    title: "Supercharger access",
    icon: "charger",
    target: "detail-supercharger_access",
    copy: "Integrated charging at Tesla-owner rates; other EVs need a paid membership for the same price.",
  },
  {
    title: "Clever storage",
    icon: "storage",
    target: "detail-boot_l",
    copy: "Frunk, boot and underfloor space. Compare capacities and measurement methods below.",
  },
  {
    title: "Powerwall home backup",
    icon: "home",
    target: "detail-bidirectional_v2g",
    copy: "Eligible US/Puerto Rico Model Ys from Oct 2026; Australian availability unconfirmed.",
  },
  {
    title: "Sentry Mode",
    icon: "sentry",
    target: "detail-sentry_parked_recording",
    copy: "Record detected activity while parked, with Sentry enabled and suitable USB storage.",
  },
  {
    title: "Phone key & driver profiles",
    icon: "phone",
    target: "chapter-05",
    copy: "Bluetooth unlock, walk-away locking and your saved seat and driving settings.",
  },
  {
    title: "Pet & Camp modes",
    icon: "pet",
    target: "detail-pet_mode",
    copy: "Cabin climate for your dog, or for nights spent camping in the car.",
  },
];

export function ModelYVerdict() {
  const pending = useRef<(() => void) | null>(null);
  useEffect(() => () => pending.current?.(), []);
  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    pending.current?.();
    history.replaceState(history.state, "", `#${id}`);
    // Chapter artwork loads on approach; keep the chosen heading in view.
    const align = () =>
      target.scrollIntoView({ block: "start", behavior: "instant" });
    const observer = new ResizeObserver(align);
    observer.observe(document.body);
    const inputs = ["wheel", "touchstart", "pointerdown", "keydown"];
    const stop = () => {
      observer.disconnect();
      clearTimeout(timer);
      inputs.forEach((type) => window.removeEventListener(type, stop));
      pending.current = null;
    };
    const timer = setTimeout(stop, 4000);
    inputs.forEach((type) =>
      window.addEventListener(type, stop, { passive: true }),
    );
    pending.current = stop;
    target.focus({ preventScroll: true });
    align();
  }
  return (
    <>
      <div className="verdict-heading">
        <RoadmarkLogo />
        <div>
          <h1>
            Tesla Model Y is the EV car of the year. <span>Here’s why.</span>
          </h1>
          <p className="verdict-introduction">Our editorial pick for 2026.</p>
        </div>
      </div>
      <nav className="verdict-reasons" aria-label="Why the Model Y is our pick">
        {reasons.map((reason, index) => (
          <a
            key={reason.target}
            className="verdict-reason"
            href={`#${reason.target}`}
            onClick={(event) => jump(event, reason.target)}
          >
            <span className="verdict-reason-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <VerdictPictogram name={reason.icon} />
            <h2>{reason.title}</h2>
            <p>{reason.copy}</p>
            <span className="verdict-reason-arrow" aria-hidden="true">
              ↓
            </span>
          </a>
        ))}
      </nav>
      <details className="verdict-evidence">
        <summary>The evidence behind our pick</summary>
        <p>
          Sales:{" "}
          <a href="https://thedriven.io/2026/10/02/australian-electric-vehicle-sales-by-month-in-2026-by-model-and-by-brand-3/">
            Australian EV sales, Jan–Sep 2026
          </a>{" "}
          and{" "}
          <a href="https://www.jato.com/resources/media-and-press-releases/tesla-model-y-worlds-best-selling-car-2023">
            JATO’s global 2023 ranking
          </a>
          . Safety:{" "}
          <a href="https://www.euroncap.com/assessments/tesla/model%2By/1181/">
            Euro NCAP’s 2025 assessment
          </a>{" "}
          supports a class award, not a universal “safest EV” claim.
        </p>
        <p>
          Tesla documents{" "}
          <a href="https://www.tesla.com/en_au/support/grok">
            Grok eligibility
          </a>
          ,{" "}
          <a href="https://www.tesla.com/en_au/support/charging/supercharging-other-evs">
            Supercharger pricing
          </a>{" "}
          and{" "}
          <a href="https://www.tesla.com/support/powershare">
            Powershare’s regional requirements
          </a>
          . The release count is a documented minimum over two years, not
          updates installed on every car; see the software timeline for
          eligibility, including Model Y L. Other brands offer driver
          assistance; FSD is Tesla’s own system and requires active supervision.
          Storage measurements differ between brands.
        </p>
        <p>
          Editorial choice, not a calculated overall score. Claims checked 8
          October 2026.
        </p>
      </details>
    </>
  );
}
