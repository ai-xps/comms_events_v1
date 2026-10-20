import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function MembersPage() {
  const user = await requireUser(["admin", "cell leader"]);
  const members = await prisma.user.findMany({
    where: user.role === "admin" ? {} : { cellId: user.cellId ?? "__none__" },
    include: { cell: true },
    orderBy: { name: "asc" }
  });
  return (
    <main>
      <div className="page-head">
        <h1>Members</h1>
        <p className="lede">
          {user.role === "admin" ? "Everyone in Gather." : "People in your cell only."}
        </p>
        {user.role === "admin" ? (
          <p>
            <Link className="button" href="/members/new">
              Add person
            </Link>
          </p>
        ) : null}
      </div>
      <div className="table-wrap">
        <table className="data stack-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cell number</th>
              <th>Cell</th>
              <th>Permission</th>
              {user.role === "admin" ? <th></th> : null}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td data-label="Name">{m.name}</td>
                <td data-label="Cell number">{m.cellNumber}</td>
                <td data-label="Cell">{m.cell?.name ?? "—"}</td>
                <td data-label="Permission">{m.role}</td>
                {user.role === "admin" ? (
                  <td data-label="Actions">
                    <Link href={`/members/${m.id}/edit`}>Edit</Link>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
