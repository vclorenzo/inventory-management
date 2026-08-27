import { AppError } from "#error/AppError.ts";
import { ListingType, Prisma, PrismaClient, Users } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllProducts = async ({
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
  sortBy = "relevance",
  sortOrder = "desc",
  page = 1,
  limit,
}: {
  search?: string;
  userId?: string;
  excludeUserId?: string;
  category?: string[];
  brand?: string[];
  condition?: string[];
  status?: string[];
  listingType?: string[];
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

    if (userId?.trim()) {
      whereParts.push(Prisma.sql`p."userId" = ${userId.trim()}`);
    }

    if (excludeUserId?.trim()) {
      whereParts.push(Prisma.sql`p."userId" <> ${excludeUserId.trim()}`);
    }

    if (category?.length) {
      whereParts.push(
        Prisma.sql`p."productCategory" IN (${Prisma.join(category)})`,
      );
    }

    if (brand?.length) {
      whereParts.push(Prisma.sql`p."brand" IN (${Prisma.join(brand)})`);
    }

    if (condition?.length) {
      whereParts.push(Prisma.sql`p."condition" IN (${Prisma.join(condition)})`);
    }

    if (status?.length) {
      whereParts.push(Prisma.sql`p."status" IN (${Prisma.join(status)})`);
    }

    const listingTypes = listingType?.filter(
      (type): type is ListingType =>
        type === "marketplace" || type === "auction",
    );
    if (listingTypes?.length) {
      whereParts.push(
        Prisma.sql`p."listingType"::text IN (${Prisma.join(listingTypes)})`,
      );
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
      orderBySql = Prisma.sql`p."stockQuantity" ${safeSortOrder}, p."name" ASC`;
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
      prisma.$queryRaw<
        (Prisma.ProductsGetPayload<object> & { userName: string })[]
      >`
        SELECT p.*
        FROM "Products" p
        INNER JOIN "Users" u ON p."userId" = u."userId"
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
    const product = await prisma.products.findFirst({
      where: {
        productId: id,
      },
      include: {
        productReviews: {
          select: { rating: true },
        },
      },
    });

    if (!product) return null;

    const ratings = product.productReviews.map((review) => review.rating);
    const reviewCount = ratings.length;
    const rating =
      reviewCount === 0
        ? null
        : ratings.reduce((sum, value) => sum + value, 0) / reviewCount;

    const { productReviews: _productReviews, ...productData } = product;

    return {
      ...productData,
      rating,
      reviewCount,
    };
  } catch (error) {
    throw error;
  }
};

export const createProduct = async ({
  name,
  userId,
  productCategory,
  brand,
  condition,
  price,
  rating,
  stockQuantity,
  status,
  listingType = "marketplace",
  description,
  paymentMethods = [],
  meetupLocations = [],
  shippingDetails,
}: {
  name: string;
  userId: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  rating: number;
  stockQuantity: number;
  status?: string;
  listingType?: ListingType;
  description: string;
  paymentMethods?: string[];
  meetupLocations?: string[];
  shippingDetails?: string | null;
}) => {
  try {
    return await prisma.products.create({
      data: {
        name,
        userId,
        productCategory,
        brand,
        condition,
        price,
        rating,
        stockQuantity,
        status: status?.trim() || "Available",
        listingType:
          listingType === "auction" ? "auction" : "marketplace",
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
  productCategory?: string;
  brand?: string;
  condition?: string;
  description?: string;
  price?: number;
  rating?: number | null;
  stockQuantity?: number;
  status?: string;
  listingType?: ListingType;
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
        productCategory: data.productCategory,
        brand: data.brand,
        condition: data.condition,
        description: data.description,
        price: data.price,
        rating: data.rating,
        stockQuantity: data.stockQuantity,
        status: data.status,
        listingType:
          data.listingType === "auction" || data.listingType === "marketplace"
            ? data.listingType
            : undefined,
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
    return await prisma.$transaction(async (tx) => {
      await tx.sales.deleteMany({ where: { productId: id } });
      await tx.purchases.deleteMany({ where: { productId: id } });
      return tx.products.delete({
        where: { productId: id },
      });
    });
  } catch (error) {
    throw error;
  }
};
