-- Product option groups + choices, and order-item option snapshot

CREATE TYPE "OptionSelection" AS ENUM ('SINGLE', 'MULTI');

CREATE TABLE "ProductOptionGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "selection" "OptionSelection" NOT NULL DEFAULT 'SINGLE',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "minSelect" INTEGER,
    "maxSelect" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOptionGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceDelta" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductOptionGroup_productId_sortOrder_idx" ON "ProductOptionGroup"("productId", "sortOrder");

CREATE INDEX "ProductOption_groupId_sortOrder_idx" ON "ProductOption"("groupId", "sortOrder");

ALTER TABLE "ProductOptionGroup" ADD CONSTRAINT "ProductOptionGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductOptionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD COLUMN "optionsJson" JSONB;
