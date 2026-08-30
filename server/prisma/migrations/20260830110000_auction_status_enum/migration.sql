-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('Available', 'Unsold', 'SoldOut', 'Unlisted');

-- Normalize legacy statuses before converting the column type.
UPDATE "Auctions"
SET "status" = 'SoldOut'
WHERE "status" IN ('Sold', 'Sold Out', 'SoldOut');

UPDATE "Auctions"
SET "status" = 'Unsold'
WHERE "status" = 'Unsold';

UPDATE "Auctions"
SET "status" = 'Unlisted'
WHERE "status" = 'Unlisted';

UPDATE "Auctions"
SET "status" = 'Available'
WHERE "status" NOT IN ('Available', 'Unsold', 'SoldOut', 'Unlisted');

-- AlterTable
ALTER TABLE "Auctions"
ALTER COLUMN "status" TYPE "AuctionStatus"
USING ("status"::"AuctionStatus");

ALTER TABLE "Auctions"
ALTER COLUMN "status" SET DEFAULT 'Available'::"AuctionStatus";

-- CreateIndex
CREATE INDEX "Auctions_status_idx" ON "Auctions"("status");
