import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      clerkUserId?: string;
      currentUser?: User;
    }
  }
}

export async function getOrCreateUser(clerkUserId: string): Promise<User> {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const inserted = await db
    .insert(usersTable)
    .values({ clerkUserId, role: "buyer" })
    .returning();
  return inserted[0];
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;
  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = clerkUserId;
  req.currentUser = await getOrCreateUser(clerkUserId);
  next();
}

export async function requireSeller(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;
  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await getOrCreateUser(clerkUserId);
  if (user.role !== "seller") {
    res.status(403).json({ error: "Seller account required" });
    return;
  }
  req.clerkUserId = clerkUserId;
  req.currentUser = user;
  next();
}
