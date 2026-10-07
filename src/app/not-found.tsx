import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <p className="eyebrow">That record is not here</p>
      <h1>
        Let’s find
        <br />
        your comparison.
      </h1>
      <p>
        The variant or page may have moved. Your research starts with the
        shortlist.
      </p>
      <Link className="button primary" href="/cars">
        Explore cars
      </Link>
    </main>
  );
}
