-- CreateTable
CREATE TABLE IF NOT EXISTS "Address" (
    "addressId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "streetName" TEXT,
    "postalCode" TEXT,
    "region" TEXT,
    "province" TEXT,
    "city" TEXT,
    "barangay" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- Migrate existing profile address rows into Address
INSERT INTO "Address" (
    "addressId",
    "profileId",
    "label",
    "streetName",
    "postalCode",
    "region",
    "province",
    "city",
    "barangay",
    "isDefault",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid()::text,
    p."profileId",
    'Home',
    NULL,
    NULL,
    p."region",
    p."province",
    p."city",
    p."barangay",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Profile" p
WHERE
    p."region" IS NOT NULL
    OR p."province" IS NOT NULL
    OR p."city" IS NOT NULL
    OR p."barangay" IS NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Address_profileId_idx" ON "Address"("profileId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Address_profileId_fkey'
    ) THEN
        ALTER TABLE "Address"
            ADD CONSTRAINT "Address_profileId_fkey"
            FOREIGN KEY ("profileId") REFERENCES "Profile"("profileId")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Drop legacy address columns from Profile
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "region";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "province";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "city";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "barangay";
