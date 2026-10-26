import Link from "next/link";
import { CategoryThumb } from "@/components/CategoryThumb";
import { CATEGORIES, type Category } from "@/lib/constants";

export function KindChooser({
  signedIn,
  selected
}: {
  signedIn: boolean;
  selected?: Category | null;
}) {
  return (
    <ul className="kind-row">
      {CATEGORIES.map((category) => {
        const browse = `/?types=${encodeURIComponent(category)}`;
        const href = signedIn ? browse : `/login?next=${encodeURIComponent(browse)}`;
        const on = selected === category;
        return (
          <li key={category}>
            <Link
              href={href}
              className="kind-circle"
              data-selected={on ? "true" : undefined}
              aria-current={on ? "true" : undefined}
            >
              <CategoryThumb category={category} size="md" />
              <span>{category}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
