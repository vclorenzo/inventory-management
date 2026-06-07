/*
  Warnings:

  - Added the required column `userId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "meetupLocations" SET DEFAULT '[]'::jsonb;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
