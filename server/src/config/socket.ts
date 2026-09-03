import logger from "#config/logger.ts";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";

const PRODUCT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const SOCKET_EVENTS = {
  JOIN_AUCTION: "joinAuction",
  LEAVE_AUCTION: "leaveAuction",
  AUCTION_BID_UPDATE: "auction:bidUpdate",
} as const;

export type AuctionBidUpdatePayload = {
  productId: string;
  bidCount: number;
  currentHighestBid: number | null;
  revision: number;
};

const auctionRoom = (productId: string) => `auction:${productId}`;

const isProductId = (value: unknown): value is string =>
  typeof value === "string" && PRODUCT_ID_RE.test(value);

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer, corsOrigins: string[]) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.length <= 1 ? corsOrigins[0] : corsOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on(SOCKET_EVENTS.JOIN_AUCTION, (productId: unknown) => {
      if (!isProductId(productId)) return;
      socket.join(auctionRoom(productId));
    });

    socket.on(SOCKET_EVENTS.LEAVE_AUCTION, (productId: unknown) => {
      if (!isProductId(productId)) return;
      socket.leave(auctionRoom(productId));
    });
  });

  logger.info("Socket.IO initialized");
  return io;
};

export const emitAuctionBidUpdate = (payload: AuctionBidUpdatePayload) => {
  if (!io) {
    logger.warn("Socket.IO is not initialized; skipping bid update");
    return;
  }

  io.to(auctionRoom(payload.productId)).emit(
    SOCKET_EVENTS.AUCTION_BID_UPDATE,
    payload,
  );
};
