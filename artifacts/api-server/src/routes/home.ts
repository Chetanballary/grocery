import { Router, type IRouter } from "express";
import {
  db,
  productsTable,
  categoriesTable,
} from "@workspace/db";
import { eq, sql, desc, asc, gt } from "drizzle-orm";
import { mapProduct } from "../lib/cart";

const router: IRouter = Router();

import { mockCategories, mockProducts } from "../lib/mockData";

router.get("/home/showcase", async (_req, res) => {
  try {
    const cats = await db.query.categoriesTable.findMany({
      orderBy: [asc(categoriesTable.sortOrder), asc(categoriesTable.name)],
    });
    const counts = await db
      .select({
        categoryId: productsTable.categoryId,
        count: sql<number>`count(*)::int`.as("count"),
      })
      .from(productsTable)
      .groupBy(productsTable.categoryId);
    const countMap = new Map(counts.map((c) => [c.categoryId, c.count]));

    const fetchWithCategory = async (whereSql: ReturnType<typeof eq> | undefined, orderBy: ReturnType<typeof asc>, limit: number) => {
      let q = db
        .select({ p: productsTable, c: categoriesTable })
        .from(productsTable)
        .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .orderBy(orderBy)
        .limit(limit)
        .$dynamic();
      if (whereSql) q = q.where(whereSql);
      return q;
    };

    const featuredRows = await fetchWithCategory(
      eq(productsTable.featured, true),
      asc(productsTable.name),
      8,
    );

    const dealRows = await db
      .select({ p: productsTable, c: categoriesTable })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(gt(productsTable.mrp, productsTable.price))
      .orderBy(desc(sql`(${productsTable.mrp} - ${productsTable.price}) / ${productsTable.mrp}`))
      .limit(8);

    const bestRows = await fetchWithCategory(
      undefined,
      desc(productsTable.ratingCount),
      8,
    );

    const mapRow = (r: { p: typeof productsTable.$inferSelect; c: typeof categoriesTable.$inferSelect }) =>
      mapProduct(r.p, {
        id: r.c.id,
        slug: r.c.slug,
        name: r.c.name,
        description: r.c.description,
        imageUrl: r.c.imageUrl,
        accentColor: r.c.accentColor,
        sortOrder: r.c.sortOrder,
      });

    res.json({
      categories: cats.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        accentColor: c.accentColor,
        sortOrder: c.sortOrder,
        productCount: countMap.get(c.id) ?? 0,
      })),
      featured: featuredRows.map(mapRow),
      topDeals: dealRows.map(mapRow),
      bestSellers: bestRows.map(mapRow),
    });
  } catch (error) {
    console.error("Database error in showcase, falling back to mock data:", error);
    const mockMapProduct = (p: any) => {
      const c = mockCategories.find(cat => cat.id === p.categoryId)!;
      return {
        ...p,
        category: c
      };
    };
    res.json({
      categories: mockCategories.map(c => ({
        ...c,
        productCount: mockProducts.filter(p => p.categoryId === c.id).length
      })),
      featured: mockProducts.filter(p => p.featured).map(mockMapProduct),
      topDeals: mockProducts.filter(p => p.mrp > p.price).map(mockMapProduct),
      bestSellers: mockProducts.map(mockMapProduct).slice(0, 8),
    });
  }
});

export default router;
