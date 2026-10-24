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
      <path
        d="M24 44c0 0-14-12.5-14-24a14 14 0 1 1 28 0c0 11.5-14 24-14 24z"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="17" r="2.4" fill="var(--sage)" />
      <path d="M14.2 23.2c.6-2.2 2-3.4 3.3-3.4s2.7 1.2 3.3 3.4" fill="none" stroke="var(--sage)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24" cy="15.5" r="2.8" fill="var(--accent)" />
      <path d="M19.8 23c.8-2.6 2.5-4 4.2-4s3.4 1.4 4.2 4" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="30.5" cy="17" r="2.4" fill="var(--gold)" />
      <path d="M27.2 23.2c.6-2.2 2-3.4 3.3-3.4s2.7 1.2 3.3 3.4" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
