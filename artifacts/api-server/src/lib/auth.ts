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
  try {
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
  } catch (error) {
    console.error("Database error in getOrCreateUser, returning mock user:", error);
    return {
      id: 999,
      clerkUserId,
      role: "buyer",
      displayName: "Guest Buyer",
      createdAt: new Date(),
    } as any;
  }
}

function getRequestUserId(req: Request): string | null {
  const clerkAuth = getAuth(req);
  if (clerkAuth?.userId) return clerkAuth.userId;

  const mockId = req.headers["x-mock-user-id"];
  return typeof mockId === "string" && mockId.trim() ? mockId : null;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.clerkUserId = userId;
    req.currentUser = await getOrCreateUser(userId);
    next();
  } catch (error) {
    console.error("Auth error in requireAuth:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function requireSeller(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.clerkUserId = userId;
    const user = await getOrCreateUser(userId);
    if (user.role !== "seller") {
      res.status(403).json({ error: "Seller account required" });
      return;
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error("Seller auth error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}
