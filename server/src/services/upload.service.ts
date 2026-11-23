import { Prisma, PrismaClient, ProductStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "#error/AppError.ts";
import { resolveProductStatus } from "#src/constants/productStatus.ts";

const prisma = new PrismaClient();

const CSV_MAX_BYTES = 2 * 1024 * 1024;
const CSV_MAX_ROWS = 200;
const MAX_STOCK_QUANTITY = 100000;

export const PRODUCT_CSV_COLUMNS = [
  "name",
  "productCategory",
  "brand",
  "condition",
  "price",
  "stockQuantity",
  "status",
  "description",
  "paymentMethods",
  "meetupLocations",
  "shippingDetails",
] as const;

type ProductCsvColumn = (typeof PRODUCT_CSV_COLUMNS)[number];

type CsvRecord = Record<ProductCsvColumn, string>;

type MeetupLocation = {
  name: string;
  address: string;
  mapLink: string;
};

type ParsedProduct = {
  name: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  description: string;
  paymentMethods: string[];
  meetupLocations: MeetupLocation[];
  shippingDetails: string;
};

type ParsedCsvRow = {
  row: number;
  product: ParsedProduct;
};

export type CsvRowError = {
  row: number;
  message: string;
};

export class CsvValidationError extends AppError {
  errors: CsvRowError[];

  constructor(errors: CsvRowError[]) {
    super("Some rows in the CSV could not be imported", 400);
    this.errors = errors;
  }
}

const SAMPLE_ROW = [
  "Sample Mechanical Keyboard",
  "Electronics",
  "Keychron",
  "Like New",
  "89.99",
  "5",
  "Available",
  "Hot-swappable keyboard with extra keycaps",
  "GCash;Cash",
  "Office|123 Main St|https://maps.example.com",
  "Ships nationwide in 2-3 days",
];

const upload = multer({
  storage: multer.memoryStorage(),
  defParamCharset: "utf8",
  limits: {
    fileSize: CSV_MAX_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!isCsvFile(file)) {
      callback(new AppError("Only CSV files can be uploaded", 400));
      return;
    }
    callback(null, true);
  },
});

export const csvUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (isMulterError(error)) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "CSV file must be 2 MB or smaller"
          : error.message;
      next(new AppError(message, 400));
      return;
    }

    next(error instanceof Error ? error : new AppError("Upload failed", 400));
  });
};

export function buildProductCsvTemplate() {
  const header = PRODUCT_CSV_COLUMNS.join(",");
  const sample = SAMPLE_ROW.map(escapeCsvCell).join(",");
  return `${header}\n${sample}\n`;
}

export function parseProductCsv(csv: string): {
  products: ParsedCsvRow[];
  errors: CsvRowError[];
} {
  if (csv.includes("\u0000")) {
    throw new AppError("The uploaded file is not a valid CSV", 400);
  }

  const table = parseCsv(csv.replace(/^\uFEFF/, ""));
  if (table.length > 0 && isBlankRow(table[table.length - 1])) {
    table.pop();
  }

  if (table.length === 0) {
    throw new AppError("The CSV file is empty", 400);
  }

  const headerIndexes = mapHeader(table[0]);
  const products: ParsedCsvRow[] = [];
  const errors: CsvRowError[] = [];
  let dataRowCount = 0;

  for (let index = 1; index < table.length; index += 1) {
    const row = table[index];
    const record = recordFromRow(row, headerIndexes);
    if (isBlankRecord(record)) continue;

    dataRowCount += 1;
    if (dataRowCount > CSV_MAX_ROWS) {
      throw new AppError(
        `A CSV upload can include at most ${CSV_MAX_ROWS} products`,
        400,
      );
    }

    const parsed = validateRow(record);
    if (parsed.ok) {
      products.push({ row: index + 1, product: parsed.product });
    } else {
      errors.push({ row: index + 1, message: parsed.message });
    }
  }

  if (dataRowCount === 0) {
    throw new AppError("Add at least one product below the header row", 400);
  }

  const duplicateErrors = findDuplicateRows(products);
  const duplicateRows = new Set(duplicateErrors.map((error) => error.row));
  errors.push(...duplicateErrors);

  return {
    products: products.filter((entry) => !duplicateRows.has(entry.row)),
    errors,
  };
}

export async function bulkCreateProducts({
  userId,
  csv,
}: {
  userId: string;
  csv: string;
}) {
  const parsed = parseProductCsv(csv);
  const existing = await prisma.products.findMany({
    where: { userId },
    select: {
      name: true,
      productCategory: true,
      brand: true,
      condition: true,
      price: true,
      stockQuantity: true,
      status: true,
      description: true,
      paymentMethods: true,
      meetupLocations: true,
      shippingDetails: true,
    },
  });
  const existingKeys = new Set(
    existing.map((product) => storedProductKey(product)),
  );
  const alreadyListed = parsed.products.flatMap((entry) =>
    existingKeys.has(productKey(entry.product))
      ? [{ row: entry.row, message: "You already listed this product" }]
      : [],
  );
  const listedRows = new Set(alreadyListed.map((error) => error.row));
  const products = parsed.products.filter(
    (entry) => !listedRows.has(entry.row),
  );
  const errors = [...parsed.errors, ...alreadyListed].sort(
    (left, right) => left.row - right.row,
  );
  if (products.length === 0) {
    throw new CsvValidationError(errors);
  }

  const result = await prisma.products.createMany({
    data: products.map(({ product }) => ({
      userId,
      name: product.name,
      productCategory: product.productCategory,
      brand: product.brand,
      condition: product.condition,
      price: product.price,
      stockQuantity: product.stockQuantity,
      status: product.status,
      description: product.description,
      paymentMethods: product.paymentMethods,
      meetupLocations: product.meetupLocations as Prisma.InputJsonValue,
      shippingDetails: product.shippingDetails,
    })),
  });

  return { createdCount: result.count, errors };
}

function isCsvFile(file: { originalname: string }) {
  return file.originalname.toLowerCase().endsWith(".csv");
}

function isMulterError(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    error.name === "MulterError" &&
    "code" in error &&
    typeof error.code === "string"
  );
}

function escapeCsvCell(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsv(content: string): string[][] {
  const text = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field.length === 0) {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    throw new AppError("The CSV has an unterminated quoted field", 400);
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function isBlankRow(row: string[]) {
  return row.every((cell) => cell.trim() === "");
}

function findDuplicateRows(products: ParsedCsvRow[]): CsvRowError[] {
  const seen = new Map<string, number>();
  const errors: CsvRowError[] = [];

  for (const entry of products) {
    const key = productKey(entry.product);
    const firstRow = seen.get(key);
    if (firstRow !== undefined) {
      errors.push({
        row: entry.row,
        message: `This row duplicates row ${firstRow}`,
      });
      continue;
    }
    seen.set(key, entry.row);
  }

  return errors;
}

function productKey(product: ParsedProduct) {
  return JSON.stringify([
    product.name,
    product.productCategory,
    product.brand,
    product.condition,
    Math.round(product.price * 100),
    product.stockQuantity,
    product.status,
    product.description,
    product.paymentMethods,
    product.meetupLocations,
    product.shippingDetails,
  ]);
}

function storedProductKey(product: {
  name: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  description: string;
  paymentMethods: string[];
  meetupLocations: Prisma.JsonValue;
  shippingDetails: string | null;
}) {
  return productKey({
    name: product.name,
    productCategory: product.productCategory,
    brand: product.brand,
    condition: product.condition,
    price: product.price,
    stockQuantity: product.stockQuantity,
    status: product.status,
    description: product.description,
    paymentMethods: product.paymentMethods,
    meetupLocations: meetupLocationsFromJson(product.meetupLocations),
    shippingDetails: product.shippingDetails ?? "",
  });
}

function meetupLocationsFromJson(value: Prisma.JsonValue): MeetupLocation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const location = item as Record<string, Prisma.JsonValue>;
    return [
      {
        name: jsonText(location.name),
        address: jsonText(location.address),
        mapLink: jsonText(location.mapLink),
      },
    ];
  });
}

function jsonText(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" ? value : "";
}

function mapHeader(headerRow: string[]) {
  const indexes = new Map<ProductCsvColumn, number>();
  const seen = new Set<string>();

  headerRow.forEach((cell, index) => {
    const name = cell.trim().toLowerCase();
    if (!name || seen.has(name)) return;
    seen.add(name);
    const column = PRODUCT_CSV_COLUMNS.find(
      (candidate) => candidate.toLowerCase() === name,
    );
    if (column) indexes.set(column, index);
  });

  const duplicate = findDuplicateHeader(headerRow);
  if (duplicate) {
    throw new AppError(`CSV column "${duplicate}" is duplicated`, 400);
  }

  const missing = PRODUCT_CSV_COLUMNS.filter((column) => !indexes.has(column));
  if (missing.length > 0) {
    throw new AppError(
      `CSV is missing columns: ${missing.join(", ")}. Download the template and keep its header row.`,
      400,
    );
  }

  return indexes;
}

function findDuplicateHeader(headerRow: string[]) {
  const seen = new Set<string>();
  for (const cell of headerRow) {
    const name = cell.trim().toLowerCase();
    if (!name) continue;
    const column = PRODUCT_CSV_COLUMNS.find(
      (candidate) => candidate.toLowerCase() === name,
    );
    if (!column) continue;
    if (seen.has(column)) return cell.trim();
    seen.add(column);
  }
  return null;
}

function recordFromRow(
  row: string[],
  indexes: Map<ProductCsvColumn, number>,
): CsvRecord {
  const record = {} as CsvRecord;
  for (const column of PRODUCT_CSV_COLUMNS) {
    const index = indexes.get(column) ?? -1;
    record[column] = (row[index] ?? "").trim();
  }
  return record;
}

function isBlankRecord(record: CsvRecord) {
  return PRODUCT_CSV_COLUMNS.every((column) => record[column] === "");
}

function splitList(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMeetupLocations(value: string): MeetupLocation[] {
  return splitList(value).map((entry) => {
    const [name = "", address = "", ...mapParts] = entry.split("|");
    return {
      name: name.trim(),
      address: address.trim(),
      mapLink: mapParts.join("|").trim(),
    };
  });
}

function normalizeStatus(value: string) {
  const compact = value.replace(/[\s_-]/g, "").toLowerCase();
  if (!compact) return undefined;
  if (compact === "available") return ProductStatus.Available;
  if (compact === "reserved") return ProductStatus.Reserved;
  if (compact === "soldout") return ProductStatus.SoldOut;
  if (compact === "unlisted") return ProductStatus.Unlisted;
  return value;
}

function requireText(
  value: string,
  label: string,
  messages: string[],
  max = 255,
) {
  if (!value) {
    messages.push(`${label} is required`);
    return;
  }
  if (value.length > max) {
    messages.push(`${label} must be ${max} characters or fewer`);
  }
}

function validateRow(
  record: CsvRecord,
): { ok: true; product: ParsedProduct } | { ok: false; message: string } {
  const messages: string[] = [];
  requireText(record.name, "Name", messages);
  requireText(record.productCategory, "Category", messages);
  requireText(record.brand, "Brand", messages);
  requireText(record.condition, "Condition", messages);
  requireText(record.description, "Description", messages, 5000);
  requireText(record.shippingDetails, "Shipping details", messages, 5000);

  let price = Number.NaN;
  if (!record.price) {
    messages.push("Price is required");
  } else {
    price = Number(record.price);
    if (!Number.isFinite(price) || price <= 0) {
      messages.push("Price must be greater than 0");
    }
  }

  let stockQuantity = Number.NaN;
  if (!record.stockQuantity) {
    messages.push("Stock is required");
  } else if (!/^\d+$/.test(record.stockQuantity)) {
    messages.push("Stock must be a whole number of 0 or more");
  } else {
    const parsedStock = Number(record.stockQuantity);
    if (parsedStock > MAX_STOCK_QUANTITY) {
      messages.push(
        `Stock must be ${MAX_STOCK_QUANTITY.toLocaleString("en-US")} or fewer`,
      );
    } else {
      stockQuantity = parsedStock;
    }
  }

  const paymentMethods = splitList(record.paymentMethods);
  if (paymentMethods.length === 0) {
    messages.push("Add at least one payment method, separated by semicolons");
  }

  const meetupLocations = parseMeetupLocations(record.meetupLocations);
  if (meetupLocations.length === 0) {
    messages.push("Add at least one meetup location as Name|Address|Map link");
  } else if (
    meetupLocations.some((location) => !location.name && !location.address)
  ) {
    messages.push("Each meetup location needs a name or an address");
  }

  let status: ProductStatus | undefined;
  if (Number.isInteger(stockQuantity)) {
    try {
      status = resolveProductStatus({
        status: normalizeStatus(record.status),
        stockQuantity,
      });
    } catch (error) {
      messages.push(
        error instanceof AppError ? error.message : "Invalid product status",
      );
    }
  }

  if (messages.length > 0 || !status || !Number.isFinite(price)) {
    return {
      ok: false,
      message: messages.join(". ") || "This row could not be imported",
    };
  }

  return {
    ok: true,
    product: {
      name: record.name,
      productCategory: record.productCategory,
      brand: record.brand,
      condition: record.condition,
      price,
      stockQuantity,
      status,
      description: record.description,
      paymentMethods,
      meetupLocations,
      shippingDetails: record.shippingDetails,
    },
  };
}
