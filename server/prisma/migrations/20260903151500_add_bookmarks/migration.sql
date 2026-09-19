-- CreateEnum
CREATE TYPE "BookmarkListingType" AS ENUM ('Marketplace', 'Auction');

-- CreateTable
CREATE TABLE "Bookmarks" (
    "bookmarkId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "listingType" "BookmarkListingType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmarks_pkey" PRIMARY KEY ("bookmarkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookmarks_userId_listingType_itemId_key" ON "Bookmarks"("userId", "listingType", "itemId");

-- CreateIndex
CREATE INDEX "Bookmarks_userId_listingType_idx" ON "Bookmarks"("userId", "listingType");

-- AddForeignKey
ALTER TABLE "Bookmarks" ADD CONSTRAINT "Bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
