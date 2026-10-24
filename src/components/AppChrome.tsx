import Link from "next/link";
import { AttendancePrompt } from "@/components/AttendancePrompt";
import { GatherMark } from "@/components/GatherMark";
import { Nav } from "@/components/Nav";
import { TabBar } from "@/components/TabBar";
import type { SessionUser } from "@/lib/session";

export function AppChrome({
  user,
  children
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="shell shell-with-tabs">
      <header className="topbar">
        <Link href="/" className="wordmark wordmark-with-mark">
          <GatherMark size="sm" />
          Gather
        </Link>
        <Nav role={user.role} />
        <div className="who">
          <span className="who-name">
            {user.name} · {user.role}
          </span>
          <form action="/api/auth/logout" method="post">
            <button className="secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <AttendancePrompt />
      {children}
      <TabBar />
    </div>
  );
}
