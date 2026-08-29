-- AlterTable
ALTER TABLE "Auctions"
ADD COLUMN "winningBidId" TEXT,
ADD COLUMN "settledAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Auctions_winningBidId_key" ON "Auctions"("winningBidId");

-- CreateIndex
CREATE INDEX "Auctions_biddingEndsAt_idx" ON "Auctions"("biddingEndsAt");

-- CreateIndex
CREATE INDEX "Auctions_settledAt_idx" ON "Auctions"("settledAt");

-- AddForeignKey
ALTER TABLE "Auctions"
ADD CONSTRAINT "Auctions_winningBidId_fkey"
FOREIGN KEY ("winningBidId") REFERENCES "Bids"("bidId")
ON DELETE SET NULL ON UPDATE CASCADE;
