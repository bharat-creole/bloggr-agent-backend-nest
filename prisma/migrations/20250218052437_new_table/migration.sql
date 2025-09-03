/*
  Warnings:

  - You are about to drop the column `timestamp` on the `ServerDynamicMetric` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[macAddress]` on the table `Server` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `macAddress` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deleted_at` to the `ServerDynamicMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ServerDynamicMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ServerDynamicMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ServerStaticMetric` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ServerDynamicMetric_serverId_timestamp_idx";

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "macAddress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServerDynamicMetric" DROP COLUMN "timestamp",
ADD COLUMN     "deleted_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServerStaticMetric" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Server_macAddress_key" ON "Server"("macAddress");

-- CreateIndex
CREATE INDEX "ServerDynamicMetric_serverId_created_at_idx" ON "ServerDynamicMetric"("serverId", "created_at");

-- CreateIndex
CREATE INDEX "ServerDynamicMetric_userId_idx" ON "ServerDynamicMetric"("userId");

-- CreateIndex
CREATE INDEX "ServerStaticMetric_userId_idx" ON "ServerStaticMetric"("userId");

-- CreateIndex
CREATE INDEX "ServerStaticMetric_serverId_idx" ON "ServerStaticMetric"("serverId");
