import { AppError } from "#error/AppError.ts";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const toDate = (value: Date | string | undefined) => {
  if (value === undefined) return undefined;
  return value instanceof Date ? value : new Date(value);
};

export const getAllAuctions = async ({
  search,
  userId,
  excludeUserId,
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
  userId?: string;
  excludeUserId?: string;
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

    const [countRows, auctions] = await prisma.$transaction([
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "Auctions" p
        WHERE ${whereSql}
      `,
      prisma.$queryRaw<
        (Prisma.AuctionsGetPayload<object> & { userName: string })[]
      >`
        SELECT p.*
        FROM "Auctions" p
        INNER JOIN "Users" u ON p."userId" = u."userId"
        WHERE ${whereSql}
        ORDER BY ${orderBySql}
        ${paginationSql}
      `,
    ]);

    const totalCount = Number(countRows[0]?.count ?? BigInt(0));
    return { auctions, totalCount };
  } catch (error) {
    throw error;
  }
};

export const getAuctionById = async (id: string) => {
  try {
    return await prisma.auctions.findFirst({
      where: {
        productId: id,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const createAuction = async ({
  name,
  userId,
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
  biddingEndsAt,
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
  description: string;
  paymentMethods?: string[];
  meetupLocations?: Prisma.InputJsonValue;
  shippingDetails?: string | null;
  biddingEndsAt: Date | string;
}) => {
  try {
    const endsAt = toDate(biddingEndsAt);
    if (!endsAt || Number.isNaN(endsAt.getTime())) {
      throw new AppError("A valid bidding end date is required", 400);
    }
    if (endsAt.getTime() <= Date.now()) {
      throw new AppError("Bidding end date must be in the future", 400);
    }

    return await prisma.auctions.create({
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
        description,
        paymentMethods,
        meetupLocations,
        shippingDetails,
        biddingEndsAt: endsAt,
        bidCount: 0,
      },
    });
  } catch (error) {
    throw error;
  }
};

type AuctionUpdatePayload = {
  name?: string;
  productCategory?: string;
  brand?: string;
  condition?: string;
  description?: string;
  price?: number;
  rating?: number | null;
  stockQuantity?: number;
  status?: string;
  paymentMethods?: string[];
  meetupLocations?: Prisma.InputJsonValue;
  shippingDetails?: string | null;
  biddingEndsAt?: Date | string;
};

export const updateAuction = async (id: string, data: AuctionUpdatePayload) => {
  try {
    const existingAuction = await getAuctionById(id);
    if (!existingAuction) {
      throw new AppError("Auction does not exist");
    }

    const biddingEndsAt = toDate(data.biddingEndsAt);

    return await prisma.auctions.update({
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
        paymentMethods: data.paymentMethods,
        meetupLocations: data.meetupLocations,
        shippingDetails: data.shippingDetails,
        biddingEndsAt,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const deleteAuction = async (id: string) => {
  try {
    const existingAuction = await getAuctionById(id);
    if (!existingAuction) {
      throw new AppError("Auction does not exist");
    }
    return await prisma.auctions.delete({
      where: { productId: id },
    });
  } catch (error) {
    throw error;
  }
};
