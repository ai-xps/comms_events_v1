import { prisma } from "@/lib/db";
import { LoginForm } from "@/components/LoginForm";

// Request-time only: Railway's image build cannot reach postgres.railway.internal.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { cellNumber: true },
    orderBy: { cellNumber: "asc" }
  });
  const cellNumbers = [...new Set(users.map((u) => u.cellNumber))];
  return <LoginForm cellNumbers={cellNumbers} />;
}
