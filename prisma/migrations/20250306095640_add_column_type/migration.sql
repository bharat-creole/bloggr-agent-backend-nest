/*
  Warnings:

  - Added the required column `type` to the `ServerMetricHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServerMetricHistory" ADD COLUMN     "type" TEXT NOT NULL;
