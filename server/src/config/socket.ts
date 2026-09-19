import logger from "#config/logger.ts";
import { JWT_SECRET } from "#config/env.ts";
import jwt from "jsonwebtoken";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";

const PRODUCT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const SOCKET_EVENTS = {
  JOIN_AUCTION: "joinAuction",
  LEAVE_AUCTION: "leaveAuction",
  AUCTION_BID_UPDATE: "auction:bidUpdate",
  NOTIFICATION_CREATED: "notification:created",
} as const;

export type AuctionBidUpdatePayload = {
  productId: string;
  bidCount: number;
  currentHighestBid: number | null;
  revision: number;
};

const auctionRoom = (productId: string) => `auction:${productId}`;
const userRoom = (userId: string) => `user:${userId}`;

const isProductId = (value: unknown): value is string =>
  typeof value === "string" && PRODUCT_ID_RE.test(value);

const parseCookies = (header: string | undefined) => {
  if (!header) return {};

  return header.split(";").reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) return cookies;

    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (!name) return cookies;

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
    return cookies;
  }, {});
};

const getUserIdFromHandshake = (cookieHeader: string | undefined) => {
  const token = parseCookies(cookieHeader).token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: unknown };
    return typeof decoded.id === "string" ? decoded.id : null;
  } catch {
    return null;
  }
};

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer, corsOrigins: string[]) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.length <= 1 ? corsOrigins[0] : corsOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const userId = getUserIdFromHandshake(socket.handshake.headers.cookie);
    if (userId) {
      socket.data.userId = userId;
    }
    next();
  });

  io.on("connection", (socket) => {
    const userId =
      typeof socket.data.userId === "string" ? socket.data.userId : null;
    if (userId) {
      socket.join(userRoom(userId));
    }

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

export const emitUserNotification = (userId: string, payload: unknown) => {
  if (!io) {
    logger.warn("Socket.IO is not initialized; skipping notification");
    return;
  }

  io.to(userRoom(userId)).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, payload);
};
