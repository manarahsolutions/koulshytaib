-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN IF NOT EXISTS "settingsJson" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Reel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "productId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LoyaltyReward" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pointsCost" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Reel_active_sortOrder_idx" ON "Reel"("active", "sortOrder");
CREATE INDEX IF NOT EXISTS "Reel_productId_idx" ON "Reel"("productId");
CREATE INDEX IF NOT EXISTS "LoyaltyReward_active_sortOrder_idx" ON "LoyaltyReward"("active", "sortOrder");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "Reel" ADD CONSTRAINT "Reel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
