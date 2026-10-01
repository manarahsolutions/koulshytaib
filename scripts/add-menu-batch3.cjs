/**
 * Add Batch 3 menu dishes:
 * 1. منسف لحم
 * 2. تمن مشكل (تمن باگلة - برياني - تمن احمر)
 *
 * Usage: node --env-file=.env scripts/add-menu-batch3.cjs
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

async function ensureCategory(name, accent, sortOrder, alternativeNames = []) {
  // Check if category exists with name or alternative names
  let existing = await prisma.category.findFirst({
    where: {
      OR: [
        { name },
        ...alternativeNames.map((n) => ({ name: n })),
      ],
    },
  });

  if (existing) {
    if (existing.name !== name) {
      existing = await prisma.category.update({
        where: { id: existing.id },
        data: { name },
      });
      console.log(`Updated category name to: "${name}"`);
    }
    return existing;
  }

  const catId = id("cat");
  console.log(`Creating new category: "${name}"`);
  return prisma.category.create({
    data: {
      id: catId,
      name,
      accent,
      href: `/menu?category=${catId}`,
      visible: true,
      sortOrder,
    },
  });
}

function singleGroup(name, options) {
  return {
    id: id("pog"),
    name,
    selection: "SINGLE",
    required: true,
    sortOrder: 1,
    options: {
      create: options.map((o, i) => ({
        id: id("po"),
        name: o.name,
        priceDelta: o.priceDelta,
        available: true,
        sortOrder: i + 1,
      })),
    },
  };
}

async function upsertProduct(input) {
  const existing = await prisma.product.findFirst({
    where: { name: input.name },
    include: { optionGroups: true },
  });

  const now = new Date();

  if (existing) {
    console.log(`Product "${input.name}" already exists, updating...`);
    // Delete existing option groups first to recreate clean options
    await prisma.productOptionGroup.deleteMany({
      where: { productId: existing.id },
    });

    return prisma.product.update({
      where: { id: existing.id },
      data: {
        description: input.description,
        price: input.price,
        categoryId: input.categoryId,
        imageSrc: input.imageSrc,
        imageAlt: input.name,
        available: true,
        visible: true,
        updatedAt: now,
        optionGroups: input.optionGroups
          ? { create: input.optionGroups }
          : undefined,
      },
    });
  }

  const max = await prisma.product.aggregate({
    where: { categoryId: input.categoryId },
    _max: { sortOrder: true },
  });

  console.log(`Creating product: "${input.name}"`);
  return prisma.product.create({
    data: {
      id: id("prod"),
      name: input.name,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
      imageSrc: input.imageSrc,
      imageAlt: input.name,
      available: true,
      visible: true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
      createdAt: now,
      updatedAt: now,
      optionGroups: input.optionGroups
        ? { create: input.optionGroups }
        : undefined,
    },
  });
}

async function main() {
  // 1. Ensure Categories
  // "أطباق رئيسية – أطباق عربية" (previously "أطباق رئيسية – أطباق عربية - ثريد وخبز")
  const catMainsArabic = await ensureCategory(
    "أطباق رئيسية – أطباق عربية",
    "navy",
    2,
    ["أطباق رئيسية – أطباق عربية - ثريد وخبز"]
  );

  // "أطباق عراقية – أطباق الأرز" (previously "أطباق رئيسية – أطباق الأرز")
  const catRice = await ensureCategory(
    "أطباق عراقية – أطباق الأرز",
    "navy",
    16,
    ["أطباق رئيسية – أطباق الأرز"]
  );

  // 2. Product 1: منسف لحم
  await upsertProduct({
    name: "منسف لحم",
    description:
      "تمن بسمتي بحبة طويلة يُقدَّم مع نص كيلو لحم الخروف ( قطعتين ) الطرية المطهية بعناية ، ويُزيَّن بالمكسرات التي تمنحه نكهة عربية أصيلة ومميزة",
    price: 23000,
    categoryId: catMainsArabic.id,
    imageSrc: "/menu/mansaf-lahm.png",
    optionGroups: [
      singleGroup("الحجم / الوجبة", [
        { name: "منسف على نص كيلو لحم", priceDelta: 0 },
        { name: "منسف على كيلو لحم", priceDelta: 20000 },
        { name: "منسف على كيلو لحم ونص دجاجة مشوية", priceDelta: 24000 },
        { name: "منسف على كيلو لحم ودجاجة كاملة مشوية", priceDelta: 29000 },
        { name: "طبق دليمية ربع كيلو لحم", priceDelta: -11000 },
      ]),
    ],
  });

  // 3. Product 2: تمن مشكل( تمن باگلة - برياني - تمن احمر )
  await upsertProduct({
    name: "تمن مشكل (تمن باگلة - برياني - تمن احمر)",
    description:
      "تمن بسمتي مطهو بعناية، بحبات متماسكة ونكهة خفيفة ومتوازنة، ويُقدَّم كطبق أساسي مع مختلف المرقات والإضافات",
    price: 1000,
    categoryId: catRice.id,
    imageSrc: "/menu/timmen-mushakal.png",
    optionGroups: [
      singleGroup("النوع", [
        { name: "ماعون تمن أبيض", priceDelta: 0 },
        { name: "ماعون تمن أحمر", priceDelta: 1000 },
        { name: "ماعون تمن برياني", priceDelta: 2000 },
      ]),
    ],
  });

  const totalProducts = await prisma.product.count();
  console.log(`Success! Total products in catalog: ${totalProducts}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
