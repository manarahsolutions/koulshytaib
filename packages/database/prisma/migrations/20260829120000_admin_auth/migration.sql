-- Phase 18: Admin authentication foundation

CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_identifier_key" ON "AdminUser"("identifier");

CREATE INDEX "AdminUser_isActive_idx" ON "AdminUser"("isActive");
