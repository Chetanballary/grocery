import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMeBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res) => {
  res.json(req.currentUser);
});

router.patch("/me", requireAuth, async (req, res) => {
  const body = UpdateMeBody.parse(req.body);
  const updated = await db
    .update(usersTable)
    .set({
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
      ...(body.sellerName !== undefined ? { sellerName: body.sellerName } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
    })
    .where(eq(usersTable.id, req.currentUser!.id))
    .returning();
  res.json(updated[0]);
});

export default router;
