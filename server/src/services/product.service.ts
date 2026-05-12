import { AppError } from "#error/AppError.ts";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllProducts = async ({
  search,
  category,
  brand,
  condition,
  status,
  minPrice,
  maxPrice,
  minRating,
  maxRating,
  minStock,
  maxStock,
  sortBy = "relevance",
  sortOrder = "desc",
  page = 1,
  limit,
}: {
  search?: string;
  category?: string[];
  brand?: string[];
  condition?: string[];
  status?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  minStock?: number;
  maxStock?: number;
  sortBy?: "relevance" | "name" | "price" | "rating" | "stockQuantity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
} = {}) => {
  try {
    const whereParts: Prisma.Sql[] = [Prisma.sql`1=1`];
    const normalizedSearch = search?.trim();
    const hasSearch = Boolean(normalizedSearch);
    const safeSortOrder =
      sortOrder?.toLowerCase() === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;

    if (category?.length) {
      whereParts.push(
        Prisma.sql`p."productCategory" IN (${Prisma.join(category)})`,
      );
    }

    if (brand?.length) {
      whereParts.push(Prisma.sql`p."brand" IN (${Prisma.join(brand)})`);
    }

    if (condition?.length) {
      whereParts.push(
        Prisma.sql`p."condition" IN (${Prisma.join(condition)})`,
      );
    }

    if (status?.length) {
      whereParts.push(Prisma.sql`p."status" IN (${Prisma.join(status)})`);
    }

    if (typeof minPrice === "number") {
      whereParts.push(Prisma.sql`p."price" >= ${minPrice}`);
    }

    if (typeof maxPrice === "number") {
      whereParts.push(Prisma.sql`p."price" <= ${maxPrice}`);
    }

    if (typeof minRating === "number") {
      whereParts.push(Prisma.sql`COALESCE(p."rating", 0) >= ${minRating}`);
    }

    if (typeof maxRating === "number") {
      whereParts.push(Prisma.sql`COALESCE(p."rating", 0) <= ${maxRating}`);
    }

    if (typeof minStock === "number") {
      whereParts.push(Prisma.sql`p."stockQuantity" >= ${minStock}`);
    }

    if (typeof maxStock === "number") {
      whereParts.push(Prisma.sql`p."stockQuantity" <= ${maxStock}`);
    }

    if (hasSearch) {
      const likeTerm = `%${normalizedSearch}%`;
      whereParts.push(Prisma.sql`
        (
          to_tsvector(
            'simple',
            concat_ws(
              ' ',
              p."name",
              p."description",
              p."brand",
              p."productCategory"
            )
          ) @@ plainto_tsquery('simple', ${normalizedSearch})
          OR p."name" ILIKE ${likeTerm}
          OR p."description" ILIKE ${likeTerm}
          OR p."brand" ILIKE ${likeTerm}
          OR p."productCategory" ILIKE ${likeTerm}
        )
      `);
    }

    const whereSql = Prisma.sql`${Prisma.join(whereParts, " AND ")}`;

    let orderBySql = Prisma.sql`p."name" ASC`;
    if (sortBy === "price") {
      orderBySql = Prisma.sql`p."price" ${safeSortOrder}, p."name" ASC`;
    } else if (sortBy === "rating") {
      orderBySql = Prisma.sql`COALESCE(p."rating", 0) ${safeSortOrder}, p."name" ASC`;
    } else if (sortBy === "stockQuantity") {
      orderBySql =
        Prisma.sql`p."stockQuantity" ${safeSortOrder}, p."name" ASC`;
    } else if (sortBy === "name") {
      orderBySql = Prisma.sql`p."name" ${safeSortOrder}`;
    } else if (hasSearch) {
      orderBySql = Prisma.sql`
        ts_rank(
          to_tsvector(
            'simple',
            concat_ws(
              ' ',
              p."name",
              p."description",
              p."brand",
              p."productCategory"
            )
          ),
          plainto_tsquery('simple', ${normalizedSearch})
        ) DESC,
        p."name" ASC
      `;
    }

    const paginationSql =
      limit !== undefined
        ? Prisma.sql`LIMIT ${limit} OFFSET ${(page - 1) * limit}`
        : Prisma.empty;

    const [countRows, products] = await prisma.$transaction([
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "Products" p
        WHERE ${whereSql}
      `,
      prisma.$queryRaw`
        SELECT p.*
        FROM "Products" p
        WHERE ${whereSql}
        ORDER BY ${orderBySql}
        ${paginationSql}
      `,
    ]);

    const totalCount = Number(countRows[0]?.count ?? BigInt(0));
    return { products, totalCount };
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (id: string) => {
  try {
    return await prisma.products.findFirst({
      where: {
        productId: id,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const createProduct = async ({
  name,
  productCategory,
  brand,
  condition,
  price,
  rating,
  stockQuantity,
  status,
  description,
  paymentMethods = [],
  meetupLocations = [],
  shippingDetails,
}: {
  name: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  rating: number;
  stockQuantity: number;
  status: string;
  description: string;
  paymentMethods?: string[];
  meetupLocations?: string[];
  shippingDetails?: string | null;
}) => {
  try {
    return await prisma.products.create({
      data: {
        name,
        productCategory,
        brand,
        condition,
        price,
        rating,
        stockQuantity,
        status,
        description,
        paymentMethods,
        meetupLocations,
        shippingDetails,
      },
    });
  } catch (error) {
    throw error;
  }
};

type ProductUpdatePayload = {
  name?: string;
  price?: number;
  rating?: number | null;
  stockQuantity?: number;
  status?: string;
  paymentMethods?: string[];
  meetupLocations?: string[];
  shippingDetails?: string | null;
};

export const updateProduct = async (id: string, data: ProductUpdatePayload) => {
  try {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      throw new AppError("Product does not exist");
    }

    return await prisma.products.update({
      where: { productId: id },
      data: {
        name: data.name,
        price: data.price,
        rating: data.rating,
        stockQuantity: data.stockQuantity,
        status: data.status,
        paymentMethods: data.paymentMethods,
        meetupLocations: data.meetupLocations,
        shippingDetails: data.shippingDetails,
      },
    });
  } catch (error) {
    throw error;
  }
};
export const deleteProduct = async (id: string) => {
  try {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      throw new AppError("Product does not exist");
    }
    return await prisma.products.delete({
      where: { productId: id },
    });
  } catch (error) {
    throw error;
  }
};
