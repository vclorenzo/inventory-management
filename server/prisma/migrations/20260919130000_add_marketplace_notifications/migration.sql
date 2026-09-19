-- AlterEnum
CREATE TYPE "NotificationType_new" AS ENUM (
    'OUTBID',
    'AUCTION_ENDED',
    'MARKETPLACE_SOLD_OUT',
    'MARKETPLACE_PRICE_DROP'
);

ALTER TABLE "Notifications"
    ALTER COLUMN "type" TYPE "NotificationType_new"
    USING ("type"::text::"NotificationType_new");

DROP TYPE "NotificationType";

ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
