"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="not-found">
      <h1>
        The comparison
        <br />
        couldn’t load.
      </h1>
      <p>Try again to reload the local research snapshot.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
