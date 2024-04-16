/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `communityId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Member` table. All the data in the column will be lost.
  - Added the required column `owner` to the `Community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `community` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Community" DROP CONSTRAINT "Community_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_communityId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_userId_fkey";

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "ownerId",
ADD COLUMN     "owner" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "communityId",
DROP COLUMN "roleId",
DROP COLUMN "userId",
ADD COLUMN     "community" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "user" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_community_fkey" FOREIGN KEY ("community") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_role_fkey" FOREIGN KEY ("role") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
