/*
  Warnings:

  - The values [M_0_3,M_3_6,M_6_PLUS,EXPLORING] on the enum `Timeline` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Buyer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `budget` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Buyer` table. All the data in the column will be lost.
  - Added the required column `city` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyType` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Buyer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."City" AS ENUM ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('Apartment', 'Villa', 'Plot', 'Office', 'Retail');

-- CreateEnum
CREATE TYPE "public"."Bhk" AS ENUM ('One', 'Two', 'Three', 'Four', 'Studio');

-- CreateEnum
CREATE TYPE "public"."Purpose" AS ENUM ('Buy', 'Rent');

-- CreateEnum
CREATE TYPE "public"."Source" AS ENUM ('Website', 'Referral', 'WalkIn', 'Call', 'Other');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Timeline_new" AS ENUM ('ZeroToThreeMonths', 'ThreeToSixMonths', 'MoreThanSixMonths', 'Exploring');
ALTER TABLE "public"."Buyer" ALTER COLUMN "timeline" TYPE "public"."Timeline_new" USING ("timeline"::text::"public"."Timeline_new");
ALTER TYPE "public"."Timeline" RENAME TO "Timeline_old";
ALTER TYPE "public"."Timeline_new" RENAME TO "Timeline";
DROP TYPE "public"."Timeline_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Buyer" DROP CONSTRAINT "Buyer_pkey",
DROP COLUMN "budget",
DROP COLUMN "createdAt",
DROP COLUMN "name",
ADD COLUMN     "bhk" "public"."Bhk",
ADD COLUMN     "budgetMax" INTEGER,
ADD COLUMN     "budgetMin" INTEGER,
ADD COLUMN     "city" "public"."City" NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "propertyType" "public"."PropertyType" NOT NULL,
ADD COLUMN     "purpose" "public"."Purpose" NOT NULL,
ADD COLUMN     "source" "public"."Source" NOT NULL,
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'New',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Buyer_id_seq";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BuyerHistory" (
    "id" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" JSONB NOT NULL,
    "buyerId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,

    CONSTRAINT "BuyerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Buyer" ADD CONSTRAINT "Buyer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BuyerHistory" ADD CONSTRAINT "BuyerHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."Buyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BuyerHistory" ADD CONSTRAINT "BuyerHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
