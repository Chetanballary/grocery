import { Router, type IRouter } from "express";
import {
  AddCartItemBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveCartItemParams,
} from "@workspace/api-zod";
import {
  loadCart,
  upsertCartItem,
  setCartItemQuantity,
  removeCartItem,
  clearCartFor,
} from "../lib/cart";
import { getSessionId } from "../lib/session";

const router: IRouter = Router();

router.get("/cart", async (req, res) => {
  const sid = getSessionId(req);
  res.json(await loadCart(sid));
});

router.delete("/cart", async (req, res) => {
  const sid = getSessionId(req);
  await clearCartFor(sid);
  res.json(await loadCart(sid));
});

router.post("/cart/items", async (req, res) => {
  const sid = getSessionId(req);
  const body = AddCartItemBody.parse(req.body);
  await upsertCartItem(sid, body.productId, body.quantity);
  res.json(await loadCart(sid));
});

router.patch("/cart/items/:productId", async (req, res) => {
  const sid = getSessionId(req);
  const params = UpdateCartItemParams.parse(req.params);
  const body = UpdateCartItemBody.parse(req.body);
  await setCartItemQuantity(sid, params.productId, body.quantity);
  res.json(await loadCart(sid));
});

router.delete("/cart/items/:productId", async (req, res) => {
  const sid = getSessionId(req);
  const params = RemoveCartItemParams.parse(req.params);
  await removeCartItem(sid, params.productId);
  res.json(await loadCart(sid));
});

export default router;
