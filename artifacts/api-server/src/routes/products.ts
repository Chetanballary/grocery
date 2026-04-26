import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, asc, type SQL } from "drizzle-orm";
import { ListProductsQueryParams } from "@workspace/api-zod";
import { mapProduct } from "../lib/cart";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  const params = ListProductsQueryParams.parse(req.query);
  const conds: SQL[] = [];
  if (params.categorySlug) {
    conds.push(eq(categoriesTable.slug, params.categorySlug));
  }
  if (params.featured !== undefined) {
    conds.push(eq(productsTable.featured, params.featured));
  }
  if (params.search) {
    conds.push(ilike(productsTable.name, `%${params.search}%`));
  }
  let q = db
    .select({ p: productsTable, c: categoriesTable })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(asc(productsTable.name))
    .$dynamic();
  if (conds.length) q = q.where(and(...conds));
  if (params.limit) q = q.limit(params.limit);
  const rows = await q;
  res.json(
    rows.map((r) =>
      mapProduct(r.p, {
        id: r.c.id,
        slug: r.c.slug,
        name: r.c.name,
        description: r.c.description,
        imageUrl: r.c.imageUrl,
        accentColor: r.c.accentColor,
        sortOrder: r.c.sortOrder,
      }),
    ),
  );
});

router.get("/products/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  const row = await db
    .select({ p: productsTable, c: categoriesTable })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.slug, slug))
    .limit(1);
  if (row.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const r = row[0];
  res.json(
    mapProduct(r.p, {
      id: r.c.id,
      slug: r.c.slug,
      name: r.c.name,
      description: r.c.description,
      imageUrl: r.c.imageUrl,
      accentColor: r.c.accentColor,
      sortOrder: r.c.sortOrder,
    }),
  );
});

export default router;
