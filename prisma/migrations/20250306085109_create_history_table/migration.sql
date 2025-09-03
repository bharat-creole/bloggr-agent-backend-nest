-- CreateTable
CREATE TABLE "ServerMetricHistory" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3) NOT NULL,
    "day1" TEXT NOT NULL,
    "days2" TEXT NOT NULL,
    "week1" TEXT NOT NULL,
    "days15" TEXT NOT NULL,
    "month1" TEXT NOT NULL,
    "months2" TEXT NOT NULL,

    CONSTRAINT "ServerMetricHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServerMetricHistory_serverId_idx" ON "ServerMetricHistory"("serverId");

-- CreateIndex
CREATE INDEX "ServerMetricHistory_userId_idx" ON "ServerMetricHistory"("userId");

-- AddForeignKey
ALTER TABLE "ServerMetricHistory" ADD CONSTRAINT "ServerMetricHistory_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
