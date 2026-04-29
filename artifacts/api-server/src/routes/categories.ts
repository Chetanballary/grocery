import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql, asc } from "drizzle-orm";

const router: IRouter = Router();

import { mockCategories, mockProducts } from "../lib/mockData";

router.get("/categories", async (_req, res) => {
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
    res.json(
      cats.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        accentColor: c.accentColor,
        sortOrder: c.sortOrder,
        productCount: countMap.get(c.id) ?? 0,
      })),
    );
  } catch (error) {
    console.error("Database error, falling back to mock categories:", error);
    res.json(mockCategories.map(c => ({
      ...c,
      productCount: mockProducts.filter(p => p.categoryId === c.id).length
    })));
  }
});

export default router;
