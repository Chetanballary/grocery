import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

const COOKIE_NAME = "fc_sid";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface SessionRequest extends Request {
  sessionId: string;
}

export function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;
  let sid = cookies?.[COOKIE_NAME];
  if (!sid || typeof sid !== "string" || sid.length < 8) {
    sid = randomUUID();
    res.cookie(COOKIE_NAME, sid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: ONE_YEAR_MS,
      path: "/",
    });
  }
  (req as SessionRequest).sessionId = sid;
  next();
}

export function getSessionId(req: Request): string {
  return (req as SessionRequest).sessionId;
}
