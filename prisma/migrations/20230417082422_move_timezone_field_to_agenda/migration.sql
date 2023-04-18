/*
  Warnings:

  - You are about to drop the column `timezone` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agenda" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "timezone";
