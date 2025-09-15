/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,phone]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Buyer_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_ownerId_phone_key" ON "public"."Buyer"("ownerId", "phone");
