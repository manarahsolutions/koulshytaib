/**
 * One-off (Oct 2026): add the dishes missing from the owner's menu list and
 * make تمن ومرگة a required single stew choice. Idempotent by product name.
 *
 * Usage (from packages/database, DATABASE_URL set):
 *   node prisma/scripts/menu-additions-2026-10.cjs          # dry run
 *   node prisma/scripts/menu-additions-2026-10.cjs --apply
 */
const { randomUUID } = require("crypto");
const { PrismaClient } = require("@prisma/client");

const MAINS = "cat_e4e683a1a09b420c9dac";
const STARTERS = "cat_0694f7c7e74f4c94bf38";
const TIMMEN_MARGA = "prod_e883efc63701479d9619";

const NEW_PRODUCTS = [
  {
    name: "مقبلات (بيتنجانية - لهانية - تبولة)",
    description:
      "تشكيلة من المقبلات المتنوعة المحضّرة من مكونات طازجة، تُقدّم كأطباق جانبية خفيفة وغنية بالنكهات، وتناسب مختلف الوجبات",
    categoryId: STARTERS,
    price: 2000,
    group: {
      name: "الحجم",
      options: [
        ["حجم عادي", 2000],
        ["صينية مقبلات حجم وسط", 12000],
        ["صينية مناسبات", 16000],
      ],
    },
  },
  {
    name: "صاج دجاج كلاسك",
    description:
      "خبز صاج طازج محشو بقطع الدجاج المتبّلة مع مكونات وإضافات متناسقة، يُحضّر على الصاج حتى يتحمّر ويمنح نكهة شهية وقوامًا مميزًا",
    categoryId: MAINS,
    price: 2500,
  },
];

async function main() {
  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient();

  for (const item of NEW_PRODUCTS) {
    const exists = await prisma.product.findFirst({
      where: { name: item.name },
    });
    if (exists) {
      console.log(`skip (exists): ${item.name}`);
      continue;
    }
    const last = await prisma.product.aggregate({
      where: { categoryId: item.categoryId },
      _max: { sortOrder: true },
    });
    const sortOrder = (last._max.sortOrder ?? 0) + 1;
    console.log(`add: ${item.name} @ ${item.categoryId} #${sortOrder}`);
    if (!apply) continue;
    await prisma.product.create({
      data: {
        id: `prod_${randomUUID().replace(/-/g, "").slice(0, 20)}`,
        name: item.name,
        description: item.description,
        categoryId: item.categoryId,
        price: item.price,
        sortOrder,
        ...(item.group
          ? {
              optionGroups: {
                create: {
                  id: randomUUID(),
                  name: item.group.name,
                  selection: "SINGLE",
                  required: true,
                  sortOrder: 1,
                  options: {
                    create: item.group.options.map(([name, total], i) => ({
                      id: randomUUID(),
                      name,
                      priceDelta: total - item.price,
                      available: true,
                      sortOrder: i + 1,
                    })),
                  },
                },
              },
            }
          : {}),
      },
    });
  }

  console.log("set: تمن ومرگة stew → SINGLE, required");
  if (apply) {
    await prisma.productOptionGroup.updateMany({
      where: { productId: TIMMEN_MARGA },
      data: { selection: "SINGLE", required: true, minSelect: null, maxSelect: null },
    });
  }

  console.log(apply ? "Applied." : "Dry run — pass --apply to write.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
