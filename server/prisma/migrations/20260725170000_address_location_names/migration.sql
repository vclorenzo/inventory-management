-- AlterTable
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "provinceCode" TEXT;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "cityCode" TEXT;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "barangayCode" TEXT;

-- Existing rows stored PSGC codes in name columns; move them to *Code
UPDATE "Address"
SET
  "regionCode" = COALESCE("regionCode", "region"),
  "provinceCode" = COALESCE("provinceCode", "province"),
  "cityCode" = COALESCE("cityCode", "city"),
  "barangayCode" = COALESCE("barangayCode", "barangay")
WHERE
  ("region" IS NOT NULL AND "region" ~ '^[0-9]+$')
  OR ("province" IS NOT NULL AND "province" ~ '^[0-9]+$')
  OR ("city" IS NOT NULL AND "city" ~ '^[0-9]+$')
  OR ("barangay" IS NOT NULL AND "barangay" ~ '^[0-9]+$');

-- Clear numeric codes from display name columns
UPDATE "Address" SET "region" = NULL WHERE "region" ~ '^[0-9]+$';
UPDATE "Address" SET "province" = NULL WHERE "province" ~ '^[0-9]+$';
UPDATE "Address" SET "city" = NULL WHERE "city" ~ '^[0-9]+$';
UPDATE "Address" SET "barangay" = NULL WHERE "barangay" ~ '^[0-9]+$';
