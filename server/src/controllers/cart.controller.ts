import * as cartService from "../services/cart";
import { AppError } from "#error/AppError.ts";
import { Request, Response } from "express";

const getUserId = (req: Request): string | undefined =>
  (req.user as { id?: string })?.id;

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const cart = await cartService.getCartByUserId(userId);
    res.status(200).json({
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart" });
  }
};

export const addCartItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { productId, quantity, currency } = req.body;

    const cart = await cartService.addCartItem({
      userId,
      productId,
      quantity,
      currency,
    });

    res.status(201).json({
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error adding item to cart" });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItemQuantity({
      cartItemId: id,
      userId,
      quantity,
    });

    res.status(200).json({
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error updating cart item" });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const cart = await cartService.removeCartItem(id, userId);

    res.status(200).json({
      message: "Cart item removed successfully",
      data: cart,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error removing cart item" });
  }
};
