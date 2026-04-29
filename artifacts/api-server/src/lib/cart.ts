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

import { mockCategories, mockProducts } from "./mockData";
import { mockCart } from "./mockStore";

export async function loadCart(sessionId: string) {
  try {
    const rows = await db.query.cartItemsTable.findMany({
      where: eq(cartItemsTable.sessionId, sessionId),
      with: {},
    });
    
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
  } catch (error) {
    console.error("Database error in loadCart, using mock:", error);
    const items = mockCart
      .filter(i => i.sessionId === sessionId)
      .map(row => {
        const p = mockProducts.find(prod => prod.id === row.productId);
        if (!p) return null;
        const cat = mockCategories.find(c => c.id === p.categoryId)!;
        const product = { ...p, category: cat };
        const lineTotal = +(product.price * row.quantity).toFixed(2);
        return {
          productId: row.productId,
          quantity: row.quantity,
          product,
          lineTotal
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
}

export async function upsertCartItem(
  sessionId: string,
  productId: number,
  quantity: number,
) {
  try {
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
  } catch (error) {
    console.error("Database error in upsertCartItem, using mock:", error);
    const existing = mockCart.find(i => i.sessionId === sessionId && i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      mockCart.push({ sessionId, productId, quantity });
    }
  }
}

export async function setCartItemQuantity(
  sessionId: string,
  productId: number,
  quantity: number,
) {
  try {
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
  } catch (error) {
    console.error("Database error in setCartItemQuantity, using mock:", error);
    const idx = mockCart.findIndex(i => i.sessionId === sessionId && i.productId === productId);
    if (quantity <= 0) {
      if (idx > -1) mockCart.splice(idx, 1);
      return;
    }
    if (idx > -1) {
      mockCart[idx].quantity = quantity;
    } else {
      mockCart.push({ sessionId, productId, quantity });
    }
  }
}

export async function removeCartItem(sessionId: string, productId: number) {
  try {
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.sessionId, sessionId),
          eq(cartItemsTable.productId, productId),
        ),
      );
  } catch (error) {
    console.error("Database error in removeCartItem, using mock:", error);
    const idx = mockCart.findIndex(i => i.sessionId === sessionId && i.productId === productId);
    if (idx > -1) mockCart.splice(idx, 1);
  }
}

export async function clearCartFor(sessionId: string) {
  try {
    await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.sessionId, sessionId));
  } catch (error) {
    console.error("Database error in clearCartFor, using mock:", error);
    for (let i = mockCart.length - 1; i >= 0; i--) {
      if (mockCart[i].sessionId === sessionId) {
        mockCart.splice(i, 1);
      }
    }
  }
}

export { mapProduct };
