import logger from "#config/logger.ts";
import { AppError } from "#error/AppError.ts";
import {
  buildProductCsvTemplate,
  bulkCreateProducts as importProducts,
  CsvValidationError,
} from "#services/upload.service.ts";
import { Request, Response } from "express";

export const downloadProductTemplate = (
  _req: Request,
  res: Response,
): void => {
  const csv = buildProductCsvTemplate();
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="product-upload-template.csv"',
  );
  res.status(200).send(csv);
};

export const bulkCreateProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as { id?: string })?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!req.file?.buffer?.length) {
      res.status(400).json({ message: "Choose a CSV file to upload" });
      return;
    }

    const result = await importProducts({
      userId,
      csv: req.file.buffer.toString("utf8"),
    });

    const createdLabel = result.createdCount === 1 ? "product" : "products";
    const skipped = result.errors.length;
    const message =
      skipped === 0
        ? `Created ${result.createdCount} ${createdLabel}`
        : `Created ${result.createdCount} ${createdLabel}. Skipped ${skipped} ${
            skipped === 1 ? "row" : "rows"
          }.`;

    res.status(201).json({
      message,
      data: result,
    });
  } catch (error) {
    if (error instanceof CsvValidationError) {
      res.status(400).json({
        message: error.message,
        errors: error.errors,
      });
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    logger.error("Failed to import products from CSV", error);
    res.status(500).json({ message: "Failed to import products" });
  }
};
