import { categoryArt } from "@/lib/category-art";

export function CategoryThumb({
  category,
  size = "md"
}: {
  category: string;
  size?: "sm" | "md" | "lg";
}) {
  const art = categoryArt(category);
  return (
    // Decorative; category name is shown next to it in the UI.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`cat-thumb cat-thumb-${size}`}
      src={art.src}
      alt=""
      width={size === "lg" ? 56 : size === "sm" ? 20 : 40}
      height={size === "lg" ? 56 : size === "sm" ? 20 : 40}
      decoding="async"
    />
  );
}
