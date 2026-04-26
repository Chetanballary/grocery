import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  orderItemsTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  PlaceOrderBody,
  GetOrderParams,
} from "@workspace/api-zod";
import { loadCart, clearCartFor } from "../lib/cart";
import { getSessionId } from "../lib/session";

const router: IRouter = Router();

function serializeOrder(
  order: typeof ordersTable.$inferSelect,
  items: (typeof orderItemsTable.$inferSelect)[],
) {
  const toNum = (v: string) => Number.parseFloat(v);
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    addressLine: order.addressLine,
    city: order.city,
    pincode: order.pincode,
    paymentMethod: order.paymentMethod as "cod" | "upi" | "card",
    notes: order.notes,
    status: order.status as
      | "placed"
      | "packed"
      | "out_for_delivery"
      | "delivered",
    subtotal: toNum(order.subtotal),
    deliveryFee: toNum(order.deliveryFee),
    total: toNum(order.total),
    createdAt: order.createdAt.toISOString(),
    items: items.map((it) => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      productImageUrl: it.productImageUrl,
      unit: it.unit,
      unitPrice: toNum(it.unitPrice),
      quantity: it.quantity,
      lineTotal: toNum(it.lineTotal),
    })),
  };
}

router.get("/orders", async (req, res) => {
  const sid = getSessionId(req);
  const orders = await db.query.ordersTable.findMany({
    where: eq(ordersTable.sessionId, sid),
    orderBy: [desc(ordersTable.createdAt)],
  });
  if (orders.length === 0) {
    res.json([]);
    return;
  }
  const ids = orders.map((o) => o.id);
  const items = await db.query.orderItemsTable.findMany({});
  const byOrder = new Map<number, (typeof orderItemsTable.$inferSelect)[]>();
  for (const it of items) {
    if (!ids.includes(it.orderId)) continue;
    if (!byOrder.has(it.orderId)) byOrder.set(it.orderId, []);
    byOrder.get(it.orderId)!.push(it);
  }
  res.json(orders.map((o) => serializeOrder(o, byOrder.get(o.id) ?? [])));
});

router.post("/orders", async (req, res) => {
  const sid = getSessionId(req);
  const body = PlaceOrderBody.parse(req.body);
  const cart = await loadCart(sid);
  if (cart.items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }
  const inserted = await db
    .insert(ordersTable)
    .values({
      sessionId: sid,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      addressLine: body.addressLine,
      city: body.city,
      pincode: body.pincode,
      paymentMethod: body.paymentMethod,
      notes: body.notes ?? null,
      status: "placed",
      subtotal: cart.subtotal.toFixed(2),
      deliveryFee: cart.deliveryFee.toFixed(2),
      total: cart.total.toFixed(2),
    })
    .returning();
  const order = inserted[0];
  const itemRows = cart.items.map((i) => ({
    orderId: order.id,
    productId: i.productId,
    productName: i.product.name,
    productImageUrl: i.product.imageUrl,
    unit: i.product.unit,
    unitPrice: i.product.price.toFixed(2),
    quantity: i.quantity,
    lineTotal: i.lineTotal.toFixed(2),
  }));
  const insertedItems = await db
    .insert(orderItemsTable)
    .values(itemRows)
    .returning();
  await clearCartFor(sid);
  res.json(serializeOrder(order, insertedItems));
});

router.get("/orders/:id", async (req, res) => {
  const sid = getSessionId(req);
  const params = GetOrderParams.parse(req.params);
  const order = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.id, params.id),
  });
  if (!order || order.sessionId !== sid) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const items = await db.query.orderItemsTable.findMany({
    where: eq(orderItemsTable.orderId, order.id),
  });
  res.json(serializeOrder(order, items));
});

export default router;
