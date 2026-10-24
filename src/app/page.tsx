import { AppChrome } from "@/components/AppChrome";
import { Welcome } from "@/components/Welcome";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dropEndedStars } from "@/lib/stars";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    await dropEndedStars();
    return (
      <AppChrome user={user}>
        <Welcome signedIn />
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
