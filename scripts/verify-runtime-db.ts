/**
 * Phase 19 — runtime PostgreSQL smoke verification.
 * Run: npm run db:verify
 * Requires DATABASE_URL and a migrated+seeded database.
 *
 * Does not log phone numbers.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

/** Minimal .env loader — no extra dependency */
function loadEnvFile() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
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
}

loadEnvFile();

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function opaqueId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

async function main() {
  console.log("Phase 19 runtime DB verification…");

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not set");
  }

  // 1) Connectivity + seed catalog
  const categories = await prisma.category.count();
  const products = await prisma.product.count();
  const offers = await prisma.offer.count();
  assert(categories > 0, "seeded categories");
  assert(products > 0, "seeded products");
  assert(offers > 0, "seeded offers");
  console.log(`✓ catalog seed (${categories} categories, ${products} products, ${offers} offers)`);

  const admin = await prisma.adminUser.findFirst({ where: { isActive: true } });
  assert(admin, "seeded admin user (set ADMIN_SEED_* and re-seed if missing)");
  console.log(`✓ admin user present (${admin.role})`);

  // 2) Guest checkout atomic path (new customer)
  const product = await prisma.product.findFirst({
    where: { visible: true, available: true },
  });
  assert(product, "available product for checkout");

  const phoneSuffix = String(Date.now()).slice(-8);
  // Valid Iraqi mobile shape 07XXXXXXXXX — synthetic, not a real person
  const phone = `070${phoneSuffix}`;
  const guestName = "ضيف تحقق";

  const checkout = await prisma.$transaction(async (tx) => {
    let customer = await tx.customer.findUnique({ where: { phone } });
    let created = false;
    if (!customer) {
      customer = await tx.customer.create({
        data: {
          id: opaqueId("cust"),
          phone,
          name: guestName,
          status: "active",
        },
      });
      created = true;
    }

    await tx.loyaltyAccount.upsert({
      where: { customerId: customer.id },
      create: {
        id: opaqueId("lya"),
        customerId: customer.id,
      },
      update: {},
    });

    const qty = 2;
    const subtotal = product.price * qty;
    const deliveryFee = 3000;
    const orderId = opaqueId("ord");

    const order = await tx.order.create({
      data: {
        id: orderId,
        customerId: customer.id,
        status: "received",
        snapshotName: guestName,
        snapshotPhone: phone,
        governorate: "بغداد",
        area: "الكرادة",
        address: "شارع تجريبي",
        paymentMethod: "cash",
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        items: {
          create: [
            {
              id: opaqueId("oi"),
              productId: product.id,
              name: product.name,
              unitPrice: product.price,
              quantity: qty,
              lineTotal: subtotal,
            },
          ],
        },
        statusHistory: {
          create: {
            id: opaqueId("osh"),
            status: "received",
            note: "verify",
          },
        },
      },
      include: { items: true, statusHistory: true },
    });

    await tx.customerActivity.create({
      data: {
        id: opaqueId("act"),
        customerId: customer.id,
        type: "order_created",
        relatedId: orderId,
      },
    });

    return { order, customer, created };
  });

  assert(checkout.created, "new guest customer created");
  assert(checkout.order.items.length === 1, "order item snapshot");
  assert(
    checkout.order.items[0]!.name === product.name,
    "item name snapshot matches product at order time",
  );
  assert(checkout.order.statusHistory.length >= 1, "initial status history");
  console.log("✓ guest checkout persistence (customer + order + items + history)");

  // 3) CRM reuse — second order same phone must not create second customer / overwrite name
  const beforeName = checkout.customer.name;
  const reuse = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUniqueOrThrow({ where: { phone } });
    const orderId = opaqueId("ord");
    await tx.order.create({
      data: {
        id: orderId,
        customerId: customer.id,
        status: "received",
        snapshotName: "اسم آخر للطلب فقط",
        snapshotPhone: phone,
        governorate: "بغداد",
        area: "المنصور",
        address: "عنوان 2",
        paymentMethod: "cash",
        subtotal: product.price,
        deliveryFee: 3000,
        total: product.price + 3000,
        items: {
          create: [
            {
              id: opaqueId("oi"),
              productId: product.id,
              name: product.name,
              unitPrice: product.price,
              quantity: 1,
              lineTotal: product.price,
            },
          ],
        },
        statusHistory: {
          create: { id: opaqueId("osh"), status: "received" },
        },
      },
    });
    return customer;
  });

  const after = await prisma.customer.findUniqueOrThrow({
    where: { id: reuse.id },
  });
  assert(after.name === beforeName, "existing customer name not overwritten");
  const orderCount = await prisma.order.count({
    where: { customerId: reuse.id },
  });
  assert(orderCount === 2, "two orders on same customer");
  console.log("✓ CRM phone resolve/reuse (name preserved)");

  // 4) Admin status transition + history persistence
  const orderId = checkout.order.id;
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "confirmed" },
    });
    await tx.orderStatusHistory.create({
      data: {
        id: opaqueId("osh"),
        orderId,
        status: "confirmed",
        note: "verify:received→confirmed",
      },
    });
  });

  const reloaded = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  assert(reloaded.status === "confirmed", "status persisted");
  assert(
    reloaded.statusHistory.some((h) => h.status === "confirmed"),
    "status history appended",
  );
  console.log("✓ admin order status + history persistence");

  // 5) Catalog mutation survives reload
  const originalAvailable = product.available;
  await prisma.product.update({
    where: { id: product.id },
    data: { available: !originalAvailable },
  });
  const flipped = await prisma.product.findUniqueOrThrow({
    where: { id: product.id },
  });
  assert(flipped.available === !originalAvailable, "availability flipped");
  await prisma.product.update({
    where: { id: product.id },
    data: { available: originalAvailable },
  });
  const restored = await prisma.product.findUniqueOrThrow({
    where: { id: product.id },
  });
  assert(restored.available === originalAvailable, "availability restored");
  console.log("✓ catalog availability mutation persistence");

  // 6) Offer featured constraint still holds after seed
  const featuredCount = await prisma.offer.count({ where: { featured: true } });
  assert(featuredCount <= 1, "at most one featured offer");
  console.log("✓ offer featured constraint");

  // 7) Notification idempotency (Phase 20)
  const idemKey = `${orderId}:ORDER_CONFIRMED:WHATSAPP`;
  const n1 = await prisma.notification.create({
    data: {
      id: opaqueId("ntf"),
      customerId: checkout.customer.id,
      orderId,
      channel: "WHATSAPP",
      type: "ORDER_CONFIRMED",
      status: "SENT",
      title: "تم تأكيد الطلب",
      body: "تحقق — بدون رقم هاتف في النص",
      idempotencyKey: idemKey,
      attempts: 1,
      provider: "mock",
      sentAt: new Date(),
    },
  });
  let duplicateBlocked = false;
  try {
    await prisma.notification.create({
      data: {
        id: opaqueId("ntf"),
        customerId: checkout.customer.id,
        orderId,
        channel: "WHATSAPP",
        type: "ORDER_CONFIRMED",
        status: "PENDING",
        title: "duplicate",
        body: "should fail",
        idempotencyKey: idemKey,
        provider: "mock",
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      duplicateBlocked = true;
    } else {
      throw error;
    }
  }
  assert(duplicateBlocked, "duplicate notification idempotency key rejected");
  assert(!n1.body.includes("07"), "notification body has no raw phone prefix");
  const forOrder = await prisma.notification.count({ where: { orderId } });
  assert(forOrder >= 1, "notifications listed for order");
  console.log("✓ notification idempotency + privacy snapshot");

  console.log("\nAll Phase 19/20 runtime checks passed.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
