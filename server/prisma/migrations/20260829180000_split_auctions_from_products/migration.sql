-- CreateTable
CREATE TABLE "Auctions" (
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION,
    "productCategory" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meetupLocations" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "shippingDetails" TEXT,
    "biddingEndsAt" TIMESTAMP(3) NOT NULL,
    "bidCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Auctions_pkey" PRIMARY KEY ("productId")
);

-- Copy auction listings out of Products
INSERT INTO "Auctions" (
    "productId",
    "userId",
    "name",
    "price",
    "rating",
    "productCategory",
    "brand",
    "condition",
    "stockQuantity",
    "status",
    "description",
    "paymentMethods",
    "meetupLocations",
    "shippingDetails",
    "biddingEndsAt",
    "bidCount"
)
SELECT
    p."productId",
    p."userId",
    p."name",
    p."price",
    p."rating",
    p."productCategory",
    p."brand",
    p."condition",
    p."stockQuantity",
    p."status",
    p."description",
    p."paymentMethods",
    p."meetupLocations",
    p."shippingDetails",
    NOW() + INTERVAL '7 days',
    COALESCE(b."bidCount", 0)
FROM "Products" p
LEFT JOIN (
    SELECT "productId", COUNT(*)::INTEGER AS "bidCount"
    FROM "Bids"
    GROUP BY "productId"
) b ON b."productId" = p."productId"
WHERE p."listingType" = 'auction';

-- Bids that are not on auction listings cannot retarget
DELETE FROM "Bids"
WHERE "productId" NOT IN (SELECT "productId" FROM "Auctions");

-- Retarget Bids to Auctions
ALTER TABLE "Bids" DROP CONSTRAINT "Bids_productId_fkey";
ALTER TABLE "Bids"
ADD CONSTRAINT "Bids_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Auctions"("productId")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Children that would block deleting auction rows from Products
DELETE FROM "CartItems"
WHERE "productId" IN (SELECT "productId" FROM "Auctions");

DELETE FROM "ProductReviews"
WHERE "productId" IN (SELECT "productId" FROM "Auctions");

DELETE FROM "Sales"
WHERE "productId" IN (SELECT "productId" FROM "Auctions");

DELETE FROM "Purchases"
WHERE "productId" IN (SELECT "productId" FROM "Auctions");

DELETE FROM "Products"
WHERE "productId" IN (SELECT "productId" FROM "Auctions");

-- AddForeignKey
ALTER TABLE "Auctions"
ADD CONSTRAINT "Auctions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "Users"("userId")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop listingType discriminator
DROP INDEX IF EXISTS "Products_listingType_idx";

ALTER TABLE "Products" DROP COLUMN IF EXISTS "listingType";

DROP TYPE IF EXISTS "ListingType";
