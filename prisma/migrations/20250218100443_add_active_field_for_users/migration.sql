/*
  Warnings:

  - Made the column `subscribedFrom` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "subscribedFrom" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;
