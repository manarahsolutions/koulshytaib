/**
 * Development seed — deterministic demo catalog from Phase 6/15 fixtures.
 * Safe to re-run (upsert by stable seed ids).
 *
 * Usage: npx prisma db seed
 * Requires DATABASE_URL.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "../../../apps/web/src/features/products/seed-catalog";
import { SEED_OFFERS } from "../../../apps/web/src/features/offers/seed-offers";
import { DEFAULT_LOYALTY_CONFIG } from "../../../apps/web/src/features/loyalty/types";

/** Load repo-root `.env` when seeding from packages/database. */
function loadRootEnv() {
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), "../../../.env"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
    return;
  }
}

loadRootEnv();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding كلشي طيب development data…");

  await prisma.appConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      loyaltyJson: DEFAULT_LOYALTY_CONFIG,
    },
    update: {
      loyaltyJson: DEFAULT_LOYALTY_CONFIG,
    },
  });

  for (const category of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        name: category.name,
        accent: category.accent,
        href: category.href,
        visible: category.visible,
        sortOrder: category.sortOrder,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      },
      update: {
        name: category.name,
        accent: category.accent,
        href: category.href,
        visible: category.visible,
        sortOrder: category.sortOrder,
      },
    });
  }

  for (const product of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        imageSrc: product.imageSrc ?? null,
        imageAlt: product.imageAlt ?? null,
        badgesJson: product.badges ?? undefined,
        available: product.available,
        visible: product.visible,
        sortOrder: product.sortOrder,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
      update: {
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        available: product.available,
        visible: product.visible,
        sortOrder: product.sortOrder,
        badgesJson: product.badges ?? undefined,
      },
    });
  }

  for (const offer of SEED_OFFERS) {
    await prisma.offer.upsert({
      where: { id: offer.id },
      create: {
        id: offer.id,
        title: offer.title,
        description: offer.description ?? null,
        type: offer.type,
        discountPercent: offer.discountPercent ?? null,
        offerPrice: offer.offerPrice ?? null,
        originalPrice: offer.originalPrice ?? null,
        visible: offer.visible,
        active: offer.active,
        featured: offer.featured,
        badge: offer.badge ?? null,
        imageSrc: offer.imageSrc ?? null,
        ctaLabel: offer.ctaLabel,
        surface: offer.surface ?? "cream",
        expiresLabel: offer.expiresLabel ?? null,
        sortOrder: offer.sortOrder,
        createdAt: new Date(offer.createdAt),
        updatedAt: new Date(offer.updatedAt),
        products: {
          create: offer.productIds.map((productId) => ({ productId })),
        },
      },
      update: {
        title: offer.title,
        description: offer.description ?? null,
        type: offer.type,
        discountPercent: offer.discountPercent ?? null,
        offerPrice: offer.offerPrice ?? null,
        originalPrice: offer.originalPrice ?? null,
        visible: offer.visible,
        active: offer.active,
        featured: offer.featured,
        badge: offer.badge ?? null,
        ctaLabel: offer.ctaLabel,
        surface: offer.surface ?? "cream",
        expiresLabel: offer.expiresLabel ?? null,
        sortOrder: offer.sortOrder,
      },
    });

    // Sync join rows on re-seed
    await prisma.offerProduct.deleteMany({ where: { offerId: offer.id } });
    await prisma.offerProduct.createMany({
      data: offer.productIds.map((productId) => ({
        offerId: offer.id,
        productId,
      })),
      skipDuplicates: true,
    });
  }

  // Demo customer (fake phone — not a real person)
  const demoPhone = "07000000001";
  await prisma.customer.upsert({
    where: { phone: demoPhone },
    create: {
      id: "demo-customer-1",
      phone: demoPhone,
      name: "زبون تجريبي",
      status: "active",
    },
    update: {
      name: "زبون تجريبي",
    },
  });

  await prisma.loyaltyAccount.upsert({
    where: { customerId: "demo-customer-1" },
    create: {
      id: "demo-loyalty-1",
      customerId: "demo-customer-1",
      pointsBalance: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
    },
    update: {},
  });

  const seedId = process.env.ADMIN_SEED_IDENTIFIER?.trim();
  const seedPassword = process.env.ADMIN_SEED_PASSWORD;
  const seedRoleRaw = process.env.ADMIN_SEED_ROLE?.trim().toUpperCase();
  const seedRole =
    seedRoleRaw === "CASHIER" || seedRoleRaw === "STAFF"
      ? "CASHIER"
      : "MANAGER";

  if (seedId && seedPassword && seedPassword.length >= 8) {
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(seedPassword, 12);
    const identifier = seedId.toLowerCase();
    // Stable id so re-seed can rotate identifier/password without leaving a stale Admin row.
    await prisma.adminUser.upsert({
      where: { id: "seed-admin-1" },
      create: {
        id: "seed-admin-1",
        identifier,
        passwordHash,
        role: seedRole,
        isActive: true,
      },
      update: {
        identifier,
        passwordHash,
        role: seedRole,
        isActive: true,
      },
    });
    console.log(`Admin seed upserted for identifier "${identifier}" (${seedRole}).`);
  } else {
    console.log(
      "Admin seed skipped — set ADMIN_SEED_IDENTIFIER and ADMIN_SEED_PASSWORD (min 8 chars) to create the first Admin.",
    );
  }

  console.log("Seed complete (development fixtures only).");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
