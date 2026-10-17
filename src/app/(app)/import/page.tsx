import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ImportForm } from "@/components/ImportForm";

export default async function ImportPage() {
  const user = await requireUser();
  if (user.role !== "admin") {
    return (
      <main className="stack">
        <div className="page-head">
          <h1>Import people</h1>
          <p className="lede">Only an admin can import people. Ask them if someone new needs an account.</p>
        </div>
        <p>
          <Link href="/calendar">Back to calendar</Link>
        </p>
      </main>
    );
  }
  return <ImportForm />;
}
