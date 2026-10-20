import { redirect } from "next/navigation";
import { prisma } from "./db";
import { readSession, type SessionUser } from "./session";
import type { Role } from "./constants";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !user.active || user.sessionVersion !== session.sv) return null;
  return {
    id: user.id,
    name: user.name,
    cellNumber: user.cellNumber,
    role: user.role as Role,
    cellId: user.cellId
  };
}

export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) {
    redirect("/calendar");
  }
  return user;
}

export function canReview(user: SessionUser): boolean {
  return user.role === "admin" || user.role === "cell leader";
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === "admin";
}

export function isLeader(user: SessionUser): boolean {
  return user.role === "cell leader";
}
