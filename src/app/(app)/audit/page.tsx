import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";

export default async function AuditPage() {
  await requireUser(["admin"]);
  const rows = await prisma.auditLog.findMany({
    orderBy: { at: "desc" },
    take: 200,
    include: { actor: true }
  });
  return (
    <main>
      <div className="page-head">
        <h1>Audit</h1>
        <p className="lede">Append-only. There is no way to edit or delete these rows in Gather.</p>
      </div>
      <div className="table-wrap">
        <table className="data stack-sm">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="date" data-label="When">
                  {formatDateTime(row.at)}
                </td>
                <td data-label="Who">{row.actor?.name ?? "system"}</td>
                <td data-label="Action">{row.action}</td>
                <td data-label="Summary">{row.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
