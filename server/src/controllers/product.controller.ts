import { Request, Response } from "express";
import * as productService from "../services/product.service";

const parseCsv = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length ? parsed : undefined;
};

const parseNumber = (value: unknown): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const getProductById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.status(200).json({
        message: "Product retrieved successfully",
        data: product,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product" });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const userId = req.query.userId?.toString();
    const excludeUserId = req.query.excludeUserId?.toString();
    const category = parseCsv(req.query.category?.toString());
    const brand = parseCsv(req.query.brand?.toString());
    const condition = parseCsv(req.query.condition?.toString());
    const status = parseCsv(req.query.status?.toString());
    const listingType = parseCsv(req.query.listingType?.toString());
    const minPrice = parseNumber(req.query.minPrice);
    const maxPrice = parseNumber(req.query.maxPrice);
    const minRating = parseNumber(req.query.minRating);
    const maxRating = parseNumber(req.query.maxRating);
    const minStock = parseNumber(req.query.minStock);
    const maxStock = parseNumber(req.query.maxStock);
    const sortBy = req.query.sortBy?.toString() as
      | "relevance"
      | "name"
      | "price"
      | "rating"
      | "stockQuantity"
      | undefined;
    const sortOrder = req.query.sortOrder?.toString() as
      | "asc"
      | "desc"
      | undefined;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const parsedLimit = Number(req.query.limit);
    const limit =
      req.query.limit !== undefined && !Number.isNaN(parsedLimit)
        ? Math.max(parsedLimit, 1)
        : undefined;

    const { products, totalCount } = await productService.getAllProducts({
      search,
      userId,
      excludeUserId,
      category,
      brand,
      condition,
      status,
      listingType,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      minStock,
      maxStock,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const totalPages =
      limit !== undefined ? Math.max(Math.ceil(totalCount / limit), 1) : 1;

    res.status(200).json({
      message: "Successfully retrieved products",
      data: products,
      page,
      limit,
      totalPages,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as { id?: string })?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const {
      name,
      productCategory,
      brand,
      condition,
      price,
      rating,
      stockQuantity,
      status,
      listingType,
      description,
      paymentMethods,
      meetupLocations,
      shippingDetails,
    } = req.body;
    const product = await productService.createProduct({
      name,
      userId,
      productCategory,
      brand,
      condition,
      price,
      rating,
      stockQuantity,
      status,
      listingType,
      description,
      paymentMethods,
      meetupLocations,
      shippingDetails,
    });
    res.status(201).json({ data: product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedProduct = await productService.updateProduct(id, data);
    res
      .status(200)
      .json({ message: "Product updated successfully", data: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedProduct = await productService.deleteProduct(id);
    res.status(200).json({
      message: `Product ${deletedProduct.name} deleted successfully`,
      data: deletedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
