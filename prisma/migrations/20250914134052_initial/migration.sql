-- CreateEnum
CREATE TYPE "public"."Timeline" AS ENUM ('M_0_3', 'M_3_6', 'M_6_PLUS', 'EXPLORING');

-- CreateTable
CREATE TABLE "public"."Buyer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "timeline" "public"."Timeline" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_email_key" ON "public"."Buyer"("email");
