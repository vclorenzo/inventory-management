-- CreateTable
CREATE TABLE "Bids" (
    "bidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "offerPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT '₱',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bids_pkey" PRIMARY KEY ("bidId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bids_userId_productId_key" ON "Bids"("userId", "productId");

-- CreateIndex
CREATE INDEX "Bids_userId_idx" ON "Bids"("userId");

-- CreateIndex
CREATE INDEX "Bids_productId_idx" ON "Bids"("productId");

-- AddForeignKey
ALTER TABLE "Bids" ADD CONSTRAINT "Bids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bids" ADD CONSTRAINT "Bids_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE CASCADE ON UPDATE CASCADE;
