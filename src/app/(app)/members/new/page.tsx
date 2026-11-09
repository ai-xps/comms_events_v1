import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MemberForm } from "@/components/MemberForm";

export default async function NewMemberPage() {
  await requireUser(["admin"]);
  const cells = await prisma.cell.findMany({ orderBy: { name: "asc" } });
  return (
    <main>
      <h1>Add person</h1>
      <MemberForm cells={cells} />
    </main>
  );
}
