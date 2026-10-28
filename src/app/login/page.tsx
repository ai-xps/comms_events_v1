import { redirect } from "next/navigation";
import { Welcome } from "@/components/Welcome";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { safeNextPath } from "@/lib/security";

// Request-time only: avoid build-time DB access when the image has no database yet.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNextPath(params.next));

  const users = await prisma.user.findMany({
    where: { active: true },
    select: { cellNumber: true },
    orderBy: { cellNumber: "asc" }
  });
  const cellNumbers = [...new Set(users.map((u) => u.cellNumber))];
  return (
    <Welcome cellNumbers={cellNumbers} focusSignIn={Boolean(params.next)} />
  );
}
