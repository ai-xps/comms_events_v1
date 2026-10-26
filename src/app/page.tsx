import { AppChrome } from "@/components/AppChrome";
import { HomeBrowse } from "@/components/HomeBrowse";
import { Welcome } from "@/components/Welcome";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dropEndedStars } from "@/lib/stars";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ types?: string; format?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    await dropEndedStars();
    return (
      <AppChrome user={user}>
        <HomeBrowse userId={user.id} typesParam={params.types} formatParam={params.format} />
      </AppChrome>
    );
  }

  const users = await prisma.user.findMany({
    where: { active: true },
    select: { cellNumber: true },
    orderBy: { cellNumber: "asc" }
  });
  const cellNumbers = [...new Set(users.map((u) => u.cellNumber))];
  return <Welcome signedIn={false} cellNumbers={cellNumbers} />;
}
