-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('OUTBID', 'AUCTION_ENDED');

-- CreateTable
CREATE TABLE "Notifications" (
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "readAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE INDEX "Notifications_userId_created_at_idx" ON "Notifications"("userId", "created_at");

-- CreateIndex
CREATE INDEX "Notifications_userId_readAt_idx" ON "Notifications"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
