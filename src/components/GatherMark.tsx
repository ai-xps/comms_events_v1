import Image from "next/image";

const MARK_PX = { sm: 36, md: 52, lg: 88 } as const;

/** Official Gather brand mark (pin + people + G). Pair with a text wordmark. */
export function GatherMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = MARK_PX[size];
  return (
    <Image
      className={`gather-mark gather-mark-${size}`}
      src="/brand/gather-mark.png"
      alt=""
      width={px}
      height={px}
      aria-hidden="true"
      priority={size === "lg"}
    />
  );
}
