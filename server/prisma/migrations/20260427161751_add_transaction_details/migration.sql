-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "meetupLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "shippingDetails" TEXT;
