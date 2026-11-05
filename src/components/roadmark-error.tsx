"use client";
import { Component, type ReactNode } from "react";
import { RoadmarkLogo } from "./roadmark-logo";
export function RoadmarkError({ retry }: { retry: () => void }) {
  return (
    <main id="main" className="roadmark-discovery">
      <section className="container discovery-hero">
        <RoadmarkLogo />
        <p className="eyebrow">Let’s get you moving again.</p>
        <h1>This view couldn’t load.</h1>
        <p className="lede">
          Your comparison may still be in the address above. Try loading it
          again, or return to discovery to choose your vehicles.
        </p>
        <div className="discovery-card-actions">
          <button className="button primary" onClick={retry}>
            Try again
          </button>
          <a
            className="button"
            href={
              typeof window !== "undefined" &&
              window.location.pathname.endsWith(".html")
                ? window.location.pathname
                : "/"
            }
          >
            Back to discovery
          </a>
        </div>
      </section>
    </main>
  );
}
export class RoadmarkErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <RoadmarkError retry={() => window.location.reload()} />
    ) : (
      this.props.children
    );
  }
}
