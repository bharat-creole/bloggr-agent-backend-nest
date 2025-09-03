-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerStaticMetric" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "staticInfo" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerStaticMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerDynamicMetric" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "dynamicInfo" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerDynamicMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Server_userId_idx" ON "Server"("userId");

-- CreateIndex
CREATE INDEX "ServerDynamicMetric_serverId_timestamp_idx" ON "ServerDynamicMetric"("serverId", "timestamp");

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerStaticMetric" ADD CONSTRAINT "ServerStaticMetric_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerDynamicMetric" ADD CONSTRAINT "ServerDynamicMetric_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
