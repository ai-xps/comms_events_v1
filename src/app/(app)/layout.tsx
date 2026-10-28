import { AppChrome } from "@/components/AppChrome";
import { requireUser } from "@/lib/auth";
import { dropEndedStars } from "@/lib/stars";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await dropEndedStars();
  return <AppChrome user={user}>{children}</AppChrome>;
}
