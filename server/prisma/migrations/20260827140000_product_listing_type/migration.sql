-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ListingType') THEN
    CREATE TYPE "ListingType" AS ENUM ('marketplace', 'auction');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Products"
ADD COLUMN IF NOT EXISTS "listingType" "ListingType" NOT NULL DEFAULT 'marketplace';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Products_listingType_idx" ON "Products"("listingType");
