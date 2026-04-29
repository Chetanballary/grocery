import { db, categoriesTable, productsTable } from "@workspace/db";
import { mockCategories, mockProducts } from "./lib/mockData";

async function seed() {
  console.log("Seeding categories...");

  const categoryIdBySlug = new Map<string, number>();

  for (const cat of mockCategories) {
    const [row] = await db
      .insert(categoriesTable)
      .values({
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        accentColor: cat.accentColor,
        sortOrder: cat.sortOrder,
      })
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: {
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          accentColor: cat.accentColor,
          sortOrder: cat.sortOrder,
        },
      })
      .returning({ id: categoriesTable.id, slug: categoriesTable.slug });

    categoryIdBySlug.set(row.slug, row.id);
  }

  console.log("Seeding products...");

  for (const prod of mockProducts) {
    const categorySlug = mockCategories.find((cat) => cat.id === prod.categoryId)?.slug;
    const categoryId = categorySlug ? categoryIdBySlug.get(categorySlug) : undefined;

    if (!categoryId) {
      throw new Error(`Missing category for product ${prod.slug}`);
    }

    await db
      .insert(productsTable)
      .values({
        slug: prod.slug,
        name: prod.name,
        description: prod.description,
        imageUrl: prod.imageUrl,
        unit: prod.unit,
        price: String(prod.price),
        mrp: String(prod.mrp),
        stock: prod.stock,
        featured: prod.featured,
        rating: String(prod.rating),
        ratingCount: prod.ratingCount,
        categoryId,
      })
      .onConflictDoUpdate({
        target: productsTable.slug,
        set: {
          name: prod.name,
          description: prod.description,
          imageUrl: prod.imageUrl,
          unit: prod.unit,
          price: String(prod.price),
          mrp: String(prod.mrp),
          stock: prod.stock,
          featured: prod.featured,
          rating: String(prod.rating),
          ratingCount: prod.ratingCount,
          categoryId,
        },
      });
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
