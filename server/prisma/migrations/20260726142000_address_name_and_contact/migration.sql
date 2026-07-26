-- AlterTable
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "contactNumber" TEXT;

-- Backfill from Users.name and Profile.contactNumber
UPDATE "Address" AS a
SET
  "name" = COALESCE(a."name", u."name"),
  "contactNumber" = COALESCE(a."contactNumber", p."contactNumber")
FROM "Profile" AS p
INNER JOIN "Users" AS u ON u."userId" = p."userId"
WHERE a."profileId" = p."profileId";

UPDATE "Address"
SET "name" = 'Unknown'
WHERE "name" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Address'
      AND column_name = 'name'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "Address" ALTER COLUMN "name" SET NOT NULL;
  END IF;
END $$;