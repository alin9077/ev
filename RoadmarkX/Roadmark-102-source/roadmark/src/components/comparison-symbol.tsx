/** Original pictograms on a shared 48-unit grid. */
export function ComparisonSymbol({ chapter }: { chapter: string }) {
  const drawings: Record<string, React.ReactNode> = {
    "02": (
      <>
        <circle cx="24" cy="25" r="15" />
        <circle cx="24" cy="25" r="4" />
        <path d="m10 21 10 3m8 0 10-3M24 29v11M18 3h12" />
      </>
    ),
    "01": (
      <>
        <path d="M8 8h17l15 15-17 17L8 25Z" />
        <circle cx="17" cy="17" r="2" />
        <path d="m23 20 7 7m-11-3 7 7" />
      </>
    ),
    "03": (
      <>
        <path d="M17 6v9m14-9v9M12 15h24v7a12 12 0 0 1-12 12v8M24 34a12 12 0 0 1-12-12" />
      </>
    ),
    "04": (
      <>
        <path d="M8 9h15v17H8zM8 26v10h22v-7H15m-7 7v6m22-6v6M29 10l7-3 7 3v9c0 5-7 9-7 9s-7-4-7-9z" />
      </>
    ),
    "05": (
      <>
        <circle cx="17" cy="17" r="10" />
        <path d="m24 24 16 16m-8-8 5-5m0 10 5-5" />
        <circle cx="14" cy="14" r="1" />
      </>
    ),
    "06": (
      <>
        <path d="M10 7h8l4 22h17v8H15L10 7Zm5 30-3 5m20-5 3 5M29 7c-6 5 6 7 0 12m9-12c-6 5 6 7 0 12" />
      </>
    ),
    "07": (
      <>
        <path d="M7 9h34v25H7zM18 41h12m-6-7v7M13 16h8v8h-8zM27 16h8m-8 7h8" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="comparison-symbol"
    >
      {drawings[chapter]}
    </svg>
  );
}
