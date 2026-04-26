import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import homeRouter from "./home";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import usersRouter from "./users";
import sellerProductsRouter from "./seller-products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(homeRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(usersRouter);
router.use(sellerProductsRouter);

export default router;
