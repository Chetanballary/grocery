import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import {
  CreateSellerProductBody,
  UpdateSellerProductBody,
  UpdateSellerProductParams,
  DeleteSellerProductParams,
} from "@workspace/api-zod";
import { requireSeller } from "../lib/auth";
import { mapProduct } from "../lib/cart";

const router: IRouter = Router();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

router.get("/seller/products", requireSeller, async (req, res) => {
  const sellerId = req.currentUser!.id;
  const rows = await db
    .select({ p: productsTable, c: categoriesTable })
    .from(productsTable)
    .innerJoin(
      categoriesTable,
      eq(productsTable.categoryId, categoriesTable.id),
    )
    .where(eq(productsTable.sellerId, sellerId))
    .orderBy(asc(productsTable.name));
  res.json(rows.map((r) => mapProduct(r.p, r.c)));
});

router.post("/seller/products", requireSeller, async (req, res) => {
  const body = CreateSellerProductBody.parse(req.body);
  const baseSlug = slugify(body.name) || `item-${Date.now()}`;
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const cat = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, body.categoryId))
    .limit(1);
  if (cat.length === 0) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }

  const inserted = await db
    .insert(productsTable)
    .values({
      slug,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      unit: body.unit,
      price: String(body.price),
      mrp: String(body.mrp),
      stock: body.stock,
      categoryId: body.categoryId,
      sellerId: req.currentUser!.id,
    })
    .returning();
  res.json(mapProduct(inserted[0], cat[0]));
});

router.patch("/seller/products/:id", requireSeller, async (req, res) => {
  const params = UpdateSellerProductParams.parse(req.params);
  const body = UpdateSellerProductBody.parse(req.body);

  const existing = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.id, params.id),
        eq(productsTable.sellerId, req.currentUser!.id),
      ),
    )
    .limit(1);
  if (existing.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const cat = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, body.categoryId))
    .limit(1);
  if (cat.length === 0) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }

  const updated = await db
    .update(productsTable)
    .set({
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      unit: body.unit,
      price: String(body.price),
      mrp: String(body.mrp),
      stock: body.stock,
      categoryId: body.categoryId,
    })
    .where(eq(productsTable.id, params.id))
    .returning();
  res.json(mapProduct(updated[0], cat[0]));
});

router.delete("/seller/products/:id", requireSeller, async (req, res) => {
  const params = DeleteSellerProductParams.parse(req.params);
  const result = await db
    .delete(productsTable)
    .where(
      and(
        eq(productsTable.id, params.id),
        eq(productsTable.sellerId, req.currentUser!.id),
      ),
    )
    .returning({ id: productsTable.id });
  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
