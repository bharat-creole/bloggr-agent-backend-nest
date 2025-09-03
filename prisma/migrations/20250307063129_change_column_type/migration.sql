/*
  Warnings:

  - Changed the type of `day1` on the `ServerMetricHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `days2` on the `ServerMetricHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `week1` on the `ServerMetricHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `days15` on the `ServerMetricHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `month1` on the `ServerMetricHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `months2` on the `ServerMetricHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ServerMetricHistory" DROP COLUMN "day1",
ADD COLUMN     "day1" JSONB NOT NULL,
DROP COLUMN "days2",
ADD COLUMN     "days2" JSONB NOT NULL,
DROP COLUMN "week1",
ADD COLUMN     "week1" JSONB NOT NULL,
DROP COLUMN "days15",
ADD COLUMN     "days15" JSONB NOT NULL,
DROP COLUMN "month1",
ADD COLUMN     "month1" JSONB NOT NULL,
DROP COLUMN "months2",
ADD COLUMN     "months2" JSONB NOT NULL;
