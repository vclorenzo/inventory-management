import { AppError } from "#error/AppError.ts";
import { isPurchasableProductStatus } from "#src/constants/productStatus.ts";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PRODUCT_IMAGE =
  "https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product1.png";

export type CartItemResponse = {
  id: string;
  image: string;
  title: string;
  unitPrice: number;
  quantity: number;
  stockLeft: number;
  currency: string;
};

export type CartGroupResponse = {
  shop: {
    name: string;
  };
  items: CartItemResponse[];
};

const cartItemInclude = {
  product: {
    include: {
      owner: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
  },
} as const;

const formatCartGroups = (
  cartItems: Awaited<
    ReturnType<
      typeof prisma.cartItems.findMany<{ include: typeof cartItemInclude }>
    >
  >,
): CartGroupResponse[] => {
  const groups = new Map<string, CartGroupResponse>();

  for (const item of cartItems) {
    const shopKey = item.product.userId;
    if (!groups.has(shopKey)) {
      groups.set(shopKey, {
        shop: { name: item.product.owner.name },
        items: [],
      });
    }

    groups.get(shopKey)!.items.push({
      id: item.cartItemId,
      image: DEFAULT_PRODUCT_IMAGE,
      title: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      stockLeft: item.product.stockQuantity,
      currency: item.currency,
    });
  }

  return Array.from(groups.values());
};

export const getCartByUserId = async (userId: string) => {
  try {
    const cartItems = await prisma.cartItems.findMany({
      where: { userId },
      include: cartItemInclude,
      orderBy: { created_at: "asc" },
    });

    return formatCartGroups(cartItems);
  } catch (error) {
    throw error;
  }
};

export const getCartItemById = async (cartItemId: string, userId: string) => {
  try {
    return await prisma.cartItems.findFirst({
      where: { cartItemId, userId },
      include: cartItemInclude,
    });
  } catch (error) {
    throw error;
  }
};

export const addCartItem = async ({
  userId,
  productId,
  quantity = 1,
  currency = "₱",
}: {
  userId: string;
  productId: string;
  quantity?: number;
  currency?: string;
}) => {
  try {
    const product = await prisma.products.findFirst({
      where: { productId },
    });

    if (!product) {
      throw new AppError("Product does not exist", 404);
    }

    if (!isPurchasableProductStatus(product.status)) {
      throw new AppError("This product is not available for purchase", 400);
    }

    if (product.stockQuantity <= 0) {
      throw new AppError("Product is out of stock", 400);
    }

    const safeQuantity = Math.max(1, Math.min(quantity, product.stockQuantity));

    const existingItem = await prisma.cartItems.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingItem) {
      const nextQuantity = Math.min(
        existingItem.quantity + safeQuantity,
        product.stockQuantity,
      );

      await prisma.cartItems.update({
        where: { cartItemId: existingItem.cartItemId },
        data: { quantity: nextQuantity },
      });
    } else {
      await prisma.cartItems.create({
        data: {
          userId,
          productId,
          quantity: safeQuantity,
          currency,
        },
      });
    }

    return getCartByUserId(userId);
  } catch (error) {
    throw error;
  }
};

export const updateCartItemQuantity = async ({
  cartItemId,
  userId,
  quantity,
}: {
  cartItemId: string;
  userId: string;
  quantity: number;
}) => {
  try {
    const existingItem = await getCartItemById(cartItemId, userId);
    if (!existingItem) {
      throw new AppError("Cart item does not exist", 404);
    }

    const stockLeft = existingItem.product.stockQuantity;
    const nextQuantity = Math.max(1, Math.min(quantity, stockLeft));

    await prisma.cartItems.update({
      where: { cartItemId },
      data: { quantity: nextQuantity },
    });

    return getCartByUserId(userId);
  } catch (error) {
    throw error;
  }
};

export const removeCartItem = async (cartItemId: string, userId: string) => {
  try {
    const existingItem = await getCartItemById(cartItemId, userId);
    if (!existingItem) {
      throw new AppError("Cart item does not exist", 404);
    }

    await prisma.cartItems.delete({
      where: { cartItemId },
    });

    return getCartByUserId(userId);
  } catch (error) {
    throw error;
  }
};
