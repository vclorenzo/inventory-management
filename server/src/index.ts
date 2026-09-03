import { errorHandler } from "#middleware/error.middleware.ts";
import { initSocket } from "#config/socket.ts";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import expenseRoutes from "./routes/expense.routes";
import productRoutes from "./routes/product.routes";
import auctionRoutes from "./routes/auction.routes";
import userRoutes from "./routes/user.routes";
import profileRoutes from "./routes/profile.routes";
import reviewRoutes from "./routes/review.routes ";
import cartRoutes from "./routes/cart.routes";
import bidRoutes from "./routes/bid.routes";
import purchaseRoutes from "./routes/purchase.routes";
import bookmarkRoutes from "./routes/bookmark.routes";
import { parseReviewPagination } from "#middleware/pagination.middleware.ts";
import { settleExpiredAuctions } from "#services/auction.service.ts";
import logger from "#config/logger.ts";
// import { botBlocker } from '#middleware/botBlocker.ts';
import securityMiddleware from "#middleware/security.middeware.ts";

const AUCTION_SETTLE_INTERVAL_MS = 15_000;

// CONFIGURATION
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.length <= 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
// app.use(botBlocker);
// app.use(securityMiddleware);

// ROUTES
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/auctions", auctionRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);
app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/reviews", parseReviewPagination, reviewRoutes);
app.use("/cart", cartRoutes);
app.use("/bids", bidRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/bookmarks", bookmarkRoutes);

// Error Handler
app.use(errorHandler);

// SERVER
const port = Number(process.env.PORT) || 8000;
const httpServer = createServer(app);
initSocket(httpServer, corsOrigins);
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`server is running on port ${port}`);
  settleExpiredAuctions().catch((error) => {
    logger.error("Failed to settle expired auctions on startup", error);
  });
  setInterval(() => {
    settleExpiredAuctions().catch((error) => {
      logger.error("Failed to settle expired auctions", error);
    });
  }, AUCTION_SETTLE_INTERVAL_MS);
});
