import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export const DELIVERY_FEE_FREE_THRESHOLD = 499;
export const DELIVERY_FEE = 29;

function toNum(v: string | number): number {
  return typeof v === "number" ? v : Number.parseFloat(v);
}

function mapProduct(
  p: typeof productsTable.$inferSelect,
  category: {
    id: number;
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
    accentColor: string;
    sortOrder: number;
  },
) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    unit: p.unit,
    price: toNum(p.price),
    mrp: toNum(p.mrp),
    stock: p.stock,
    featured: p.featured,
    rating: toNum(p.rating),
    ratingCount: p.ratingCount,
    category,
  };
}

export async function loadCart(sessionId: string) {
  const rows = await db.query.cartItemsTable.findMany({
    where: eq(cartItemsTable.sessionId, sessionId),
    with: {},
  });
  if (rows.length === 0) {
    return {
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      itemCount: 0,
    };
  }

  const products = await db.query.productsTable.findMany({});
  const categories = await db.query.categoriesTable.findMany({});
  const catById = new Map(categories.map((c) => [c.id, c]));
  const productById = new Map(products.map((p) => [p.id, p]));

  const items = rows
    .map((row) => {
      const p = productById.get(row.productId);
      if (!p) return null;
      const cat = catById.get(p.categoryId);
      if (!cat) return null;
      const product = mapProduct(p, cat);
      const lineTotal = +(product.price * row.quantity).toFixed(2);
      return {
        productId: row.productId,
        quantity: row.quantity,
        product,
        lineTotal,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = +items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);
  const deliveryFee =
    subtotal === 0 || subtotal >= DELIVERY_FEE_FREE_THRESHOLD
      ? 0
      : DELIVERY_FEE;
  const total = +(subtotal + deliveryFee).toFixed(2);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return { items, subtotal, deliveryFee, total, itemCount };
}

export async function upsertCartItem(
  sessionId: string,
  productId: number,
  quantity: number,
) {
  const existing = await db.query.cartItemsTable.findFirst({
    where: and(
      eq(cartItemsTable.sessionId, sessionId),
      eq(cartItemsTable.productId, productId),
    ),
  });
  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      quantity,
    });
  }
}

export async function setCartItemQuantity(
  sessionId: string,
  productId: number,
  quantity: number,
) {
  if (quantity <= 0) {
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.sessionId, sessionId),
          eq(cartItemsTable.productId, productId),
        ),
      );
    return;
  }
  const existing = await db.query.cartItemsTable.findFirst({
    where: and(
      eq(cartItemsTable.sessionId, sessionId),
      eq(cartItemsTable.productId, productId),
    ),
  });
  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId, quantity });
  }
}

export async function removeCartItem(sessionId: string, productId: number) {
  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId),
      ),
    );
}

export async function clearCartFor(sessionId: string) {
  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));
}

export { mapProduct };
