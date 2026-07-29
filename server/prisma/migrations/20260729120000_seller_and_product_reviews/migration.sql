-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
ALTER TABLE "Reviews" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Reviews" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Reviews_userId_idx" ON "Reviews"("userId");
CREATE INDEX IF NOT EXISTS "Reviews_orderId_idx" ON "Reviews"("orderId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Reviews_userId_reviewerId_orderId_key"
ON "Reviews"("userId", "reviewerId", "orderId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProductReviews" (
    "productReviewId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductReviews_pkey" PRIMARY KEY ("productReviewId")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductReviews_productId_idx" ON "ProductReviews"("productId");
CREATE INDEX IF NOT EXISTS "ProductReviews_orderId_idx" ON "ProductReviews"("orderId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProductReviews_productId_reviewerId_orderId_key"
ON "ProductReviews"("productId", "reviewerId", "orderId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductReviews_productId_fkey'
  ) THEN
    ALTER TABLE "ProductReviews"
      ADD CONSTRAINT "ProductReviews_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Products"("productId")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductReviews_reviewerId_fkey'
  ) THEN
    ALTER TABLE "ProductReviews"
      ADD CONSTRAINT "ProductReviews_reviewerId_fkey"
      FOREIGN KEY ("reviewerId") REFERENCES "Users"("userId")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
