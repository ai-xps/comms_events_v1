import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { AttendancePrompt } from "@/components/AttendancePrompt";
import { dropEndedStars } from "@/lib/stars";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await dropEndedStars();
  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/calendar" className="wordmark">
          Gather
        </Link>
        <Nav role={user.role} />
        <div className="who">
          <span className="who-name">
            {user.name} · {user.role}
          </span>
          <form action="/api/auth/logout" method="post">
            <button className="ghost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <AttendancePrompt />
      {children}
    </div>
  );
}
