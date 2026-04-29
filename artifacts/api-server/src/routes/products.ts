import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, asc, type SQL } from "drizzle-orm";
import { ListProductsQueryParams } from "@workspace/api-zod";
import { mapProduct } from "../lib/cart";

const router: IRouter = Router();

import { mockCategories, mockProducts } from "../lib/mockData";

router.get("/products", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Database error in products list, falling back to mock:", error);
    const params = ListProductsQueryParams.parse(req.query);
    let filtered = [...mockProducts];
    if (params.categorySlug) {
      const cat = mockCategories.find(c => c.slug === params.categorySlug);
      if (cat) filtered = filtered.filter(p => p.categoryId === cat.id);
    }
    if (params.featured !== undefined) {
      filtered = filtered.filter(p => p.featured === params.featured);
    }
    if (params.search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
    }
    if (params.limit) filtered = filtered.slice(0, params.limit);
    
    res.json(filtered.map(p => {
      const c = mockCategories.find(cat => cat.id === p.categoryId)!;
      return { ...p, category: c };
    }));
  }
});

router.get("/products/:slug", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Database error in product detail, falling back to mock:", error);
    const slug = String(req.params.slug);
    const p = mockProducts.find(prod => prod.slug === slug);
    if (!p) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const c = mockCategories.find(cat => cat.id === p.categoryId)!;
    res.json({ ...p, category: c });
  }
});

export default router;
