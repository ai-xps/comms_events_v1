import { redirect } from "next/navigation";

/** Old Search URLs land on Home browse with the same query. */
export default async function SearchRedirectPage({
  searchParams
}: {
  searchParams: Promise<{ types?: string; format?: string }>;
}) {
  const params = await searchParams;
  const sp = new URLSearchParams();
  if (params.types) sp.set("types", params.types);
  if (params.format) sp.set("format", params.format);
  const q = sp.toString();
  redirect(q ? `/?${q}` : "/");
}
