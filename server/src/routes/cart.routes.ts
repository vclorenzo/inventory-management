import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "#controllers/cart.controller.ts";
import { authenticateToken } from "#middleware/auth.middleware.ts";
import { validate } from "#middleware/validate.middleware.ts";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "#validations/cart.validations.ts";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);

router.get("/", getCart);
router.post("/", validate(addCartItemSchema), addCartItem);
router.put("/:id", validate(updateCartItemSchema), updateCartItem);
router.delete("/:id", removeCartItem);

export default router;
