/*
  Warnings:

  - You are about to drop the column `userId` on the `Agenda` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Agenda` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_userId_fkey";

-- AlterTable
ALTER TABLE "Agenda" DROP COLUMN "userId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_AddedAgendas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AddedAgendas_AB_unique" ON "_AddedAgendas"("A", "B");

-- CreateIndex
CREATE INDEX "_AddedAgendas_B_index" ON "_AddedAgendas"("B");

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddedAgendas" ADD CONSTRAINT "_AddedAgendas_A_fkey" FOREIGN KEY ("A") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddedAgendas" ADD CONSTRAINT "_AddedAgendas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
