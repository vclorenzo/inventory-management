-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('Available', 'Reserved', 'SoldOut', 'Unlisted');

-- Normalize legacy statuses before converting the column type.
UPDATE "Products"
SET "status" = 'SoldOut'
WHERE "stockQuantity" <= 0;

UPDATE "Products"
SET "status" = CASE
  WHEN "stockQuantity" = 1 THEN 'Reserved'
  ELSE 'Available'
END
WHERE "status" = 'Unavailable';

UPDATE "Products"
SET "status" = 'Available'
WHERE "status" NOT IN ('Available', 'Reserved', 'SoldOut', 'Unlisted');

-- AlterTable
ALTER TABLE "Products"
ALTER COLUMN "status" TYPE "ProductStatus"
USING ("status"::"ProductStatus");

ALTER TABLE "Products"
ALTER COLUMN "status" SET DEFAULT 'Available'::"ProductStatus";

-- CreateIndex
CREATE INDEX "Products_status_idx" ON "Products"("status");
