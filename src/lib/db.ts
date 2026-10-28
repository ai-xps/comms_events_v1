import { PrismaClient } from "@prisma/client";
import { ensureSqlitePragmas } from "./sqlite";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  sqlitePragmaPromise?: Promise<void>;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function kickPragmas(): void {
  if (!globalForPrisma.sqlitePragmaPromise) {
    globalForPrisma.sqlitePragmaPromise = ensureSqlitePragmas(prisma).catch((err) => {
      globalForPrisma.sqlitePragmaPromise = undefined;
      console.error("SQLite PRAGMA setup failed", err);
    });
  }
}

kickPragmas();
