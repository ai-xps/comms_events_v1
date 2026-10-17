import { prisma } from "@/lib/db";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { cellNumber: true },
    orderBy: { cellNumber: "asc" }
  });
  return <LoginForm cellNumbers={users.map((u) => u.cellNumber)} />;
}
