
import { db, categoriesTable, productsTable } from "@workspace/db";
import { mockCategories, mockProducts } from "./lib/mockData";

async function seed() {
  console.log("Seeding categories...");
  for (const cat of mockCategories) {
    await db.insert(categoriesTable).values({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
      accentColor: cat.accentColor,
      sortOrder: cat.sortOrder,
    }).onConflictDoUpdate({
      target: categoriesTable.id,
      set: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        accentColor: cat.accentColor,
        sortOrder: cat.sortOrder,
      }
    });
  }

  console.log("Seeding products...");
  for (const prod of mockProducts) {
    await db.insert(productsTable).values({
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      description: prod.description,
      imageUrl: prod.imageUrl,
      unit: prod.unit,
      price: prod.price,
      mrp: prod.mrp,
      stock: prod.stock,
      featured: prod.featured,
      rating: String(prod.rating),
      ratingCount: prod.ratingCount,
      categoryId: prod.categoryId,
    }).onConflictDoUpdate({
      target: productsTable.id,
      set: {
        slug: prod.slug,
        name: prod.name,
        description: prod.description,
        imageUrl: prod.imageUrl,
        unit: prod.unit,
        price: prod.price,
        mrp: prod.mrp,
        stock: prod.stock,
        featured: prod.featured,
        rating: String(prod.rating),
        ratingCount: prod.ratingCount,
        categoryId: prod.categoryId,
      }
    });
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
