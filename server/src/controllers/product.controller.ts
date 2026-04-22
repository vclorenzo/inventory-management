import { Request, Response } from "express";
import * as productService from "../services/product.service";

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
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const { products, totalCount } = await productService.getAllProducts({
      search,
      page,
      limit,
    });
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

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
    const {
      name,
      productCategory,
      brand,
      condition,
      price,
      rating,
      stockQuantity,
      description,
    } = req.body;
    const product = await productService.createProduct({
      name,
      productCategory,
      brand,
      condition,
      price,
      rating,
      stockQuantity,
      description,
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
    res.status(200).json({ data: updatedProduct });
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
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
