/**
 * Add the next batch of production menu dishes (keep existing).
 * Usage: node --env-file=.env.vercel.local scripts/add-production-menu-batch2.cjs
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

async function ensureCategory(name, accent, sortOrder) {
  const existing = await prisma.category.findFirst({ where: { name } });
  if (existing) return existing;
  const catId = id("cat");
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

function multiGroup(name, optionNames, sortOrder = 2) {
  return {
    id: id("pog"),
    name,
    selection: "MULTI",
    required: false,
    sortOrder,
    options: {
      create: optionNames.map((n, i) => ({
        id: id("po"),
        name: n,
        priceDelta: 0,
        available: true,
        sortOrder: i + 1,
      })),
    },
  };
}

async function createProduct(input) {
  const existing = await prisma.product.findFirst({ where: { name: input.name } });
  if (existing) {
    console.log("skip existing", input.name);
    return existing;
  }
  const max = await prisma.product.aggregate({
    where: { categoryId: input.categoryId },
    _max: { sortOrder: true },
  });
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
      optionGroups: input.optionGroups
        ? { create: input.optionGroups }
        : undefined,
    },
  });
}

async function main() {
  const catArouq = await ensureCategory(
    "أطباق عراقية – معجنات ومقبلات",
    "yellow",
    10,
  );
  const catIraqiMains = await ensureCategory(
    "أطباق عراقية – أطباق رئيسية",
    "navy",
    11,
  );
  const catSweets = await ensureCategory("حلويات – كليچة", "cream", 12);
  const catMahashi = await ensureCategory("أطباق عراقية – محاشي", "green", 13);
  const catKibbeh = await ensureCategory("مقبلات – كبة", "raspberry", 14);
  const catFatayer = await ensureCategory("معجنات – فطائر", "yellow", 15);
  const catRice = await ensureCategory("أطباق رئيسية – أطباق الأرز", "navy", 16);
  const catEastern = await ensureCategory("اطباق شرقية - محاشي", "green", 17);

  await createProduct({
    name: "عروگ طاوة",
    description:
      "أقراص عراقية تقليدية من العجين الممزوج باللحم المفروم العراقي 100% والبصل المفروم والبهارات، تُقلى حتى تتحمر وتكتسب نكهة غنية",
    price: 1500,
    categoryId: catArouq.id,
    imageSrc: "/menu/arouq-tawwa.png",
    optionGroups: [
      singleGroup("الحجم / الكمية", [
        { name: "6 قطع مقلي", priceDelta: 0 },
        { name: "نص كيلو عجين", priceDelta: 3500 },
        { name: "كيلو عجين", priceDelta: 8500 },
      ]),
    ],
  });

  await createProduct({
    name: "تمن ومرگة",
    description:
      "تمن بسمتي بحبة طويلة يُقدّم مع مرگات متنوعة حسب الطلب ( فاصوليا - باميا -) ، محضّرة بمكونات طازجة متوازنة لنكهة عراقية أصيلة",
    price: 3000,
    categoryId: catIraqiMains.id,
    imageSrc: "/menu/timmen-marqa.png",
    optionGroups: [multiGroup("نوع المرقة", ["فاصوليا", "باميا"])],
  });

  await createProduct({
    name: "كليچة",
    description:
      "كليچة مشكل بأنواع متعددة (تمر، سمسم، حلقوم، جوز مبروش، لب جوز، خفيفي) أو كليچة عادي حسب الطلب",
    price: 10000,
    categoryId: catSweets.id,
    imageSrc: "/menu/klecha.png",
    optionGroups: [
      singleGroup("النوع والكمية", [
        { name: "كيلو كليچة عادي (مثلاً تمر)", priceDelta: 0 },
        { name: "كيلو مشكل بدون لب جوز", priceDelta: 500 },
        {
          name: "كيلو كليچة مشكل (تمر، سمسم، حلقوم، جوز مبروش، لب جوز، خفيفي)",
          priceDelta: 2000,
        },
        { name: "كيلوين مشكل", priceDelta: 13000 },
      ]),
    ],
  });

  await createProduct({
    name: "دولمة",
    description:
      "خضار مشكلة محشوة بالأرز المتبّل مع الحشوة التقليدية، تُطهى ببطء حتى تتجانس النكهات وتصبح غنية وشهية",
    price: 12000,
    categoryId: catMahashi.id,
    imageSrc: "/menu/dolma.png",
    optionGroups: [
      singleGroup("الحجم", [
        { name: "صغير بدون ضلوع", priceDelta: 0 },
        { name: "وسط بدون ضلوع", priceDelta: 5000 },
        { name: "وسط بالضلوع", priceDelta: 15000 },
        { name: "كبير بدون ضلوع", priceDelta: 15000 },
        { name: "كبير بالضلوع", priceDelta: 25000 },
      ]),
    ],
  });

  await createProduct({
    name: "كبة حلب بالتمن العنبر بالدجاج",
    description:
      "كبة مقلية بقشرة ذهبية مقرمشة، محشوة بحشوة الدجاج المتبّلة، بطعم غني وقوام شهي",
    price: 11500,
    categoryId: catKibbeh.id,
    imageSrc: "/menu/kibbeh-halab.png",
    optionGroups: [
      singleGroup("التحضير (25 قطعة)", [
        { name: "مفرزنات", priceDelta: 0 },
        { name: "قلي (+3000)", priceDelta: 3000 },
      ]),
    ],
  });

  await createProduct({
    name: "فطائر الجبن والكرفي",
    description:
      "فطائر ذهبية هشة محشوة بمزيج من الجبن والكرفس الطازج، بنكهة متوازنة",
    price: 750,
    categoryId: catFatayer.id,
    imageSrc: "/menu/fatayer-cheese.png",
  });

  await createProduct({
    name: "دجاج على برياني",
    description:
      "تمن برياني متبّل بالبهارات ، يُقدّم مع دجاج مشوي متبل بعناية، ليجمع بين نكهة البرياني الغنية وطعم الشواء المميز",
    price: 6000,
    categoryId: catRice.id,
    imageSrc: "/menu/chicken-biryani.png",
    optionGroups: [
      singleGroup("الوجبة", [
        { name: "فخذ على برياني (شخص واحد)", priceDelta: 0 },
        { name: "نص دجاجة وبرياني (تكفي 3 أشخاص)", priceDelta: 7000 },
        { name: "دجاجة كاملة مع جدر برياني", priceDelta: 17000 },
      ]),
    ],
  });

  await createProduct({
    name: "ورق عنب",
    description:
      "ورق عنب طري محشو بالتمن المتبّل مع خلطة مميزة من الخضراوات ، يُطبخ ببطء لمدة خمس ساعات بزيت الزيتون الاصلي ودبس الرمان حتى يتجانس الطعم ويصبح غنيًا وشهيًا",
    price: 6000,
    categoryId: catEastern.id,
    imageSrc: "/menu/warak-enab.png",
    optionGroups: [
      singleGroup("الحجم", [
        { name: "وجبة (شخص واحد)", priceDelta: 0 },
        { name: "صينية (3 أشخاص)", priceDelta: 14000 },
        { name: "جدر (5 أشخاص)", priceDelta: 19000 },
      ]),
    ],
  });

  const count = await prisma.product.count();
  console.log("Done. Total products:", count);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
