/*
  Warnings:

  - You are about to drop the `_AddedAgendas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Agenda` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AddedAgendas" DROP CONSTRAINT "_AddedAgendas_A_fkey";

-- DropForeignKey
ALTER TABLE "_AddedAgendas" DROP CONSTRAINT "_AddedAgendas_B_fkey";

-- AlterTable
ALTER TABLE "Agenda" ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "_AddedAgendas";
