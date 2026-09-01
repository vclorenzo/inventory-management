import { AppError } from "#error/AppError.ts";
import logger from "#config/logger.ts";
import {
  AUCTION_STATUS,
  PUBLIC_AUCTION_STATUS,
  resolveCreateAuctionStatus,
  resolveUpdatedAuctionStatus,
} from "#src/constants/auctionStatus.ts";
import { AuctionStatus, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const highestValidBidOrder = [
  { offerPrice: "desc" as const },
  { updated_at: "asc" as const },
];

const toDate = (value: Date | string | undefined) => {
  if (value === undefined) return undefined;
  return value instanceof Date ? value : new Date(value);
};

type AuctionTiming = {
  biddingEndsAt: Date;
  status: AuctionStatus | string;
  settledAt: Date | null;
};

export const isAuctionOpen = (auction: AuctionTiming) => {
  if (auction.settledAt) return false;
  if (auction.status !== AUCTION_STATUS.Available) return false;
  return auction.biddingEndsAt.getTime() > Date.now();
};

const findHighestValidBid = (
  client: Prisma.TransactionClient | PrismaClient,
  productId: string,
  startingPrice: number,
) =>
  client.bids.findFirst({
    where: {
      productId,
      offerPrice: { gte: startingPrice },
    },
    orderBy: highestValidBidOrder,
    include: {
      user: {
        select: { name: true },
      },
    },
  });

export const settleAuctionIfClosed = async (productId: string) => {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT "productId" FROM "Auctions"
        WHERE "productId" = ${productId}
        FOR UPDATE
      `;

      const auction = await tx.auctions.findFirst({
        where: { productId },
      });

      if (!auction) return null;
      if (auction.settledAt) return auction;
      if (auction.status !== AUCTION_STATUS.Available) return auction;
      if (auction.biddingEndsAt.getTime() > Date.now()) return auction;

      const winner = await findHighestValidBid(
        tx,
        productId,
        auction.price,
      );

      return tx.auctions.update({
        where: { productId },
        data: {
          winningBidId: winner?.bidId ?? null,
          settledAt: new Date(),
          status: winner ? AUCTION_STATUS.SoldOut : AUCTION_STATUS.Unsold,
        },
      });
    });
  } catch (error) {
    throw error;
  }
};

export const settleExpiredAuctions = async () => {
  try {
    const expired = await prisma.auctions.findMany({
      where: {
        settledAt: null,
        biddingEndsAt: { lte: new Date() },
        status: AUCTION_STATUS.Available,
      },
      select: { productId: true },
    });

    for (const auction of expired) {
      await settleAuctionIfClosed(auction.productId);
    }

    return expired.length;
  } catch (error) {
    logger.error("Error settling expired auctions", error);
    throw error;
  }
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
  sortBy = "relevance",
  sortOrder = "desc",
  page = 1,
  limit,
  listed = false,
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
  sortBy?: "relevance" | "name" | "price";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  listed?: boolean;
} = {}) => {
  try {
    await settleExpiredAuctions();

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

    if (listed) {
      whereParts.push(
        Prisma.sql`p."status" = CAST(${PUBLIC_AUCTION_STATUS} AS "AuctionStatus")`,
      );
    } else if (status?.length) {
      whereParts.push(Prisma.sql`p."status"::text IN (${Prisma.join(status)})`);
    }

    if (typeof minPrice === "number") {
      whereParts.push(Prisma.sql`p."price" >= ${minPrice}`);
    }

    if (typeof maxPrice === "number") {
      whereParts.push(Prisma.sql`p."price" <= ${maxPrice}`);
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
        (Prisma.AuctionsGetPayload<object> & {
          currentHighestBid: number | null;
        })[]
      >`
        SELECT p.*, high."currentHighestBid"
        FROM "Auctions" p
        INNER JOIN "Users" u ON p."userId" = u."userId"
        LEFT JOIN LATERAL (
          SELECT b."offerPrice" AS "currentHighestBid"
          FROM "Bids" b
          WHERE b."productId" = p."productId"
            AND b."offerPrice" >= p."price"
          ORDER BY b."offerPrice" DESC, b."updated_at" ASC
          LIMIT 1
        ) high ON true
        WHERE ${whereSql}
        ORDER BY ${orderBySql}
        ${paginationSql}
      `,
    ]);

    const totalCount = Number(countRows[0]?.count ?? BigInt(0));
    return {
      auctions: auctions.map((auction) => ({
        ...auction,
        currentHighestBid:
          auction.currentHighestBid == null
            ? null
            : Number(auction.currentHighestBid),
        isOpen: isAuctionOpen(auction),
        winningBid: null,
        viewerBid: null,
      })),
      totalCount,
    };
  } catch (error) {
    throw error;
  }
};

export const getAuctionById = async (
  id: string,
  viewerUserId?: string,
  { listedOnly = false }: { listedOnly?: boolean } = {},
) => {
  try {
    await settleAuctionIfClosed(id);

    const auction = await prisma.auctions.findFirst({
      where: {
        productId: id,
        ...(listedOnly
          ? { status: { not: AUCTION_STATUS.Unlisted } }
          : {}),
      },
      include: {
        winningBid: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!auction) return null;

    const leadingBid = await findHighestValidBid(
      prisma,
      auction.productId,
      auction.price,
    );
    const viewerBidRecord = viewerUserId
      ? await prisma.bids.findFirst({
          where: { productId: id, userId: viewerUserId },
        })
      : null;

    const isOpen = isAuctionOpen(auction);
    const { winningBid: winningBidRecord, ...auctionFields } = auction;

    return {
      ...auctionFields,
      currentHighestBid: leadingBid?.offerPrice ?? null,
      isOpen,
      winningBid:
        !isOpen && winningBidRecord
          ? {
              bidId: winningBidRecord.bidId,
              offerPrice: winningBidRecord.offerPrice,
              bidderName: winningBidRecord.user.name,
            }
          : null,
      viewerBid: viewerBidRecord
        ? {
            bidId: viewerBidRecord.bidId,
            offerPrice: viewerBidRecord.offerPrice,
            isLeading: leadingBid?.bidId === viewerBidRecord.bidId,
            isWinner: auction.winningBidId === viewerBidRecord.bidId,
          }
        : null,
    };
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
        status: resolveCreateAuctionStatus(status),
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

    const biddingEndsAt =
      toDate(data.biddingEndsAt) ?? existingAuction.biddingEndsAt;
    const isRelisting =
      existingAuction.status === AUCTION_STATUS.Unsold &&
      (data.status?.trim() === AUCTION_STATUS.Available ||
        (data.biddingEndsAt !== undefined &&
          biddingEndsAt.getTime() > Date.now()));
    const nextStatus = resolveUpdatedAuctionStatus({
      requestedStatus: isRelisting
        ? AUCTION_STATUS.Available
        : data.status,
      existingStatus: existingAuction.status as AuctionStatus,
      biddingEndsAt,
      isRelisting,
    });
    const shouldResetSettlement =
      nextStatus === AUCTION_STATUS.Available &&
      (existingAuction.status === AUCTION_STATUS.Unsold ||
        existingAuction.settledAt != null);

    if (shouldResetSettlement) {
      return await prisma.$transaction(async (tx) => {
        await tx.auctions.update({
          where: { productId: id },
          data: { winningBidId: null },
        });
        await tx.bids.deleteMany({ where: { productId: id } });
        return tx.auctions.update({
          where: { productId: id },
          data: {
            name: data.name,
            productCategory: data.productCategory,
            brand: data.brand,
            condition: data.condition,
            description: data.description,
            price: data.price,
            status: nextStatus,
            paymentMethods: data.paymentMethods,
            meetupLocations: data.meetupLocations,
            shippingDetails: data.shippingDetails,
            biddingEndsAt,
            settledAt: null,
            bidCount: 0,
          },
        });
      });
    }

    return await prisma.auctions.update({
      where: { productId: id },
      data: {
        name: data.name,
        productCategory: data.productCategory,
        brand: data.brand,
        condition: data.condition,
        description: data.description,
        price: data.price,
        status: nextStatus,
        paymentMethods: data.paymentMethods,
        meetupLocations: data.meetupLocations,
        shippingDetails: data.shippingDetails,
        biddingEndsAt: toDate(data.biddingEndsAt),
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
    await prisma.auctions.update({
      where: { productId: id },
      data: { winningBidId: null },
    });
    return await prisma.auctions.delete({
      where: { productId: id },
    });
  } catch (error) {
    throw error;
  }
};
