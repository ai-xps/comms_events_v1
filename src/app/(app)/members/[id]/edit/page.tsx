import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MemberForm } from "@/components/MemberForm";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["admin"]);
  const { id } = await params;
  const member = await prisma.user.findUnique({ where: { id } });
  if (!member) notFound();
  const cells = await prisma.cell.findMany({ orderBy: { name: "asc" } });
  return (
    <main>
      <h1>Edit {member.name}</h1>
      <MemberForm
        cells={cells}
        member={{
          id: member.id,
          name: member.name,
          cellNumber: member.cellNumber,
          role: member.role,
          cellId: member.cellId,
          active: member.active
        }}
      />
    </main>
  );
}
