/** Map pin with three people — berry, sage, and gold. Decorative; wordmark carries the name. */
export function GatherMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "lg" ? 72 : size === "sm" ? 28 : 48;
  return (
    <svg
      className={`gather-mark gather-mark-${size}`}
      width={px}
      height={px}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      {/* Soft blush fill so the pin reads at small sizes */}
      <path
        d="M24 44c0 0-14-12.5-14-24a14 14 0 1 1 28 0c0 11.5-14 24-14 24z"
        fill="var(--paper-2)"
        opacity="0.9"
      />
      <path
        d="M24 44c0 0-14-12.5-14-24a14 14 0 1 1 28 0c0 11.5-14 24-14 24z"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.75"
        strokeLinejoin="round"
      />
      {/* Left person — sage */}
      <circle cx="16.8" cy="16.2" r="2.7" fill="var(--sage)" />
      <path
        d="M12.8 24.2c.7-2.8 2.4-4.2 4-4.2s3.3 1.4 4 4.2"
        fill="none"
        stroke="var(--sage)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Centre person — berry */}
      <circle cx="24" cy="14.6" r="3.1" fill="var(--accent)" />
      <path
        d="M18.6 24c.9-3.1 2.9-4.8 5.4-4.8s4.5 1.7 5.4 4.8"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right person — gold */}
      <circle cx="31.2" cy="16.2" r="2.7" fill="var(--gold)" />
      <path
        d="M27.2 24.2c.7-2.8 2.4-4.2 4-4.2s3.3 1.4 4 4.2"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
