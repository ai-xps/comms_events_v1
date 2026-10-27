import Image from "next/image";

const MARK_PX = { sm: 32, md: 48, lg: 96 } as const;
/** Full lockup (mark + wordmark) height — width follows the asset ratio. */
const LOCKUP_H = { sm: 56, md: 96, lg: 168 } as const;
const LOCKUP_RATIO = 623 / 884;

/**
 * Official Gather brand mark (pin + people + G).
 * Use `lockup` on the welcome door (includes the Gather wordmark).
 * Elsewhere use the mark alone next to a text wordmark.
 */
export function GatherMark({
  size = "md",
  lockup = false
}: {
  size?: "sm" | "md" | "lg";
  lockup?: boolean;
}) {
  if (lockup) {
    const height = LOCKUP_H[size];
    const width = Math.round(height * LOCKUP_RATIO);
    return (
      <Image
        className={`gather-mark gather-mark-lockup gather-mark-${size}`}
        src="/brand/gather-logo.png"
        alt="Gather"
        width={width}
        height={height}
        priority={size === "lg"}
      />
    );
  }

  const px = MARK_PX[size];
  return (
    <Image
      className={`gather-mark gather-mark-${size}`}
      src="/brand/gather-mark.png"
      alt=""
      width={px}
      height={px}
      aria-hidden="true"
    />
  );
}
