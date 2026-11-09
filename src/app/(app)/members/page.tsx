import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MembersAdminTable } from "@/components/MembersAdminTable";

export default async function MembersPage() {
  const user = await requireUser(["admin", "cell leader"]);
  const members = await prisma.user.findMany({
    where: user.role === "admin" ? {} : { cellId: user.cellId ?? "__none__" },
    include: { cell: true },
    orderBy: { name: "asc" }
  });

  if (user.role === "admin") {
    return (
      <main>
        <div className="page-head">
          <h1>Members</h1>
          <p className="lede">Everyone in Gather. Tick people, then Delete selected, before a fresh Import.</p>
        </div>
        <MembersAdminTable
          selfId={user.id}
          members={members.map((m) => ({
            id: m.id,
            name: m.name,
            cellNumber: m.cellNumber,
            cellName: m.cell?.name ?? "—",
            role: m.role
          }))}
        />
      </main>
    );
  }

  return (
    <main>
      <div className="page-head">
        <h1>Members</h1>
        <p className="lede">People in your cell only.</p>
      </div>
      <div className="table-wrap">
        <table className="data stack-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cell number</th>
              <th>Cell</th>
              <th>Permission</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td data-label="Name">{m.name}</td>
                <td data-label="Cell number">{m.cellNumber}</td>
                <td data-label="Cell">{m.cell?.name ?? "—"}</td>
                <td data-label="Permission">{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
