export type VerdictPictogramName =
  | "wheel"
  | "updates"
  | "safety"
  | "charger"
  | "storage"
  | "home"
  | "sentry"
  | "phone"
  | "pet";

const body = "var(--pictogram-body)";
const light = "var(--pictogram-light)";
const accent = "var(--pictogram-accent)";
const ink = "var(--ink)";

/** Solid three-tone pictograms on a 24-unit grid, drawn to read at 24px. */
export function VerdictPictogram({ name }: { name: VerdictPictogramName }) {
  const drawings: Record<VerdictPictogramName, React.ReactNode> = {
    wheel: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke={body} strokeWidth="3" />
        <path d="M4.5 11.5h15M12 13v7" stroke={body} strokeWidth="2.6" />
        <circle cx="12" cy="12" r="3" fill={body} />
        <circle cx="12" cy="12" r="1.2" fill={accent} />
      </>
    ),
    updates: (
      <>
        <path
          d="M10 1.5c.8 4.9 3.6 7.7 8.5 8.5-4.9.8-7.7 3.6-8.5 8.5-.8-4.9-3.6-7.7-8.5-8.5 4.9-.8 7.7-3.6 8.5-8.5Z"
          fill={body}
        />
        <circle cx="18" cy="18" r="5" fill={accent} />
        <path
          d="M18 15.2v5.2m-2.3-2.2 2.3 2.3 2.3-2.3"
          stroke={ink}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    safety: (
      <>
        <path
          d="m12 1.5 8.5 3.2v6.8c0 5-3.5 8.9-8.5 11-5-2.1-8.5-6-8.5-11V4.7Z"
          fill={body}
        />
        <path
          d="m12 1.5 8.5 3.2v6.8c0 5-3.5 8.9-8.5 11Z"
          fill={light}
          opacity=".16"
        />
        <path
          d="m12 6.6 1.26 3.37 3.6.15-2.83 2.23.98 3.47L12 13.82l-3.01 2 .98-3.47-2.83-2.23 3.6-.15Z"
          fill={accent}
        />
      </>
    ),
    charger: (
      <>
        <rect x="4" y="2.5" width="11" height="17.5" rx="2.2" fill={body} />
        <rect x="2.5" y="19.5" width="14" height="2.5" rx="1.25" fill={body} />
        <path
          d="M15 9.5h1.6A1.4 1.4 0 0 1 18 10.9v5.4a1.75 1.75 0 0 0 3.5 0V8.2L19.3 6"
          stroke={body}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10.6 5.5 6.8 11.4h2.5l-.9 5.1 3.8-5.9H9.7Z" fill={accent} />
      </>
    ),
    storage: (
      <>
        <path
          d="M9 7V5.2a1.7 1.7 0 0 1 1.7-1.7h2.6A1.7 1.7 0 0 1 15 5.2V7"
          stroke={body}
          strokeWidth="1.8"
        />
        <rect x="3.5" y="6.5" width="17" height="13.5" rx="2.6" fill={body} />
        <path d="M7.2 6.5h2.3V20H7.2zM14.5 6.5h2.3V20h-2.3z" fill={accent} />
        <circle cx="7.5" cy="21.2" r="1.3" fill={body} />
        <circle cx="16.5" cy="21.2" r="1.3" fill={body} />
      </>
    ),
    home: (
      <>
        <path
          d="M12 2 22.5 11.2h-2.7V21a1 1 0 0 1-1 1H5.2a1 1 0 0 1-1-1v-9.8H1.5Z"
          fill={body}
        />
        <path
          d="m13.4 9.2-4.6 6.1h2.8l-1 4.7 4.6-6.1h-2.8Z"
          fill={accent}
        />
      </>
    ),
    sentry: (
      <>
        <path
          d="M1 12c2.6-4.7 6.4-7.5 11-7.5S20.4 7.3 23 12c-2.6 4.7-6.4 7.5-11 7.5S3.6 16.7 1 12Z"
          fill={body}
        />
        <circle cx="12" cy="12" r="4.6" fill={light} />
        <circle cx="12" cy="12" r="2.4" fill="var(--pictogram-record)" />
      </>
    ),
    phone: (
      <>
        <rect x="5.5" y="1.5" width="13" height="21" rx="2.8" fill={body} />
        <circle cx="12" cy="8.3" r="2.5" stroke={accent} strokeWidth="1.8" />
        <path
          d="M12 10.8v7.2m0-1.4h2.4M12 14h1.8"
          stroke={accent}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),
    pet: (
      <g fill={body}>
        <path d="M12 11.5c-3.2 0-6.3 3.2-6.3 6.2 0 1.9 1.4 3.1 3.3 3.1 1.3 0 1.9-.6 3-.6s1.7.6 3 .6c1.9 0 3.3-1.2 3.3-3.1 0-3-3.1-6.2-6.3-6.2Z" />
        <ellipse cx="4.6" cy="10.4" rx="2" ry="2.6" transform="rotate(-18 4.6 10.4)" />
        <ellipse cx="9.2" cy="5.8" rx="2.1" ry="2.8" transform="rotate(-6 9.2 5.8)" />
        <ellipse cx="14.8" cy="5.8" rx="2.1" ry="2.8" transform="rotate(6 14.8 5.8)" />
        <ellipse cx="19.4" cy="10.4" rx="2" ry="2.6" transform="rotate(18 19.4 10.4)" />
      </g>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
      className="verdict-pictogram"
    >
      {drawings[name]}
    </svg>
  );
}
