-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN "idempotencyKey" TEXT;

UPDATE "Notifications"
SET "idempotencyKey" = "notificationId"
WHERE "idempotencyKey" IS NULL;

ALTER TABLE "Notifications" ALTER COLUMN "idempotencyKey" SET NOT NULL;

CREATE UNIQUE INDEX "Notifications_idempotencyKey_key"
ON "Notifications"("idempotencyKey");
