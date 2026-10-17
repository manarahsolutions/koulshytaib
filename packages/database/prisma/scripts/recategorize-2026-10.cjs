/**
 * One-off (Oct 2026): collapse the 11 ad-hoc categories into 5 short ones.
 * Nothing is deleted — leftover categories are only hidden.
 *
 * Usage (from packages/database, DATABASE_URL set):
 *   node prisma/scripts/recategorize-2026-10.cjs          # dry run
 *   node prisma/scripts/recategorize-2026-10.cjs --apply
 */
const { PrismaClient } = require("@prisma/client");

const CATEGORIES = [
  {
    id: "cat_e4e683a1a09b420c9dac",
    name: "أطباق رئيسية",
    accent: "navy",
    products: [
      "prod_5bb13c9d46d1420aa599", // منسف لحم
      "prod_439d0be19b80485e8301", // منسف دجاج
      "prod_e7079171584b431281cd", // دجاج على برياني
      "prod_e883efc63701479d9619", // تمن ومرگة
      "prod_44a0067fdf444e958296", // تمن مشكل
    ],
  },
  {
    id: "cat_035d6e59e04946c4bdf3",
    name: "محاشي",
    accent: "green",
    products: [
      "prod_fd1a39f2b0b246029dde", // دولمة
      "prod_5a426938329541518210", // ورق عنب
    ],
  },
  {
    id: "cat_0694f7c7e74f4c94bf38",
    name: "مقبلات",
    accent: "raspberry",
    products: [
      "prod_05ad0dba21814b868bf7", // كبة حلب
      "prod_c69c33647e01460c81eb", // عروگ طاوة
      "prod_08b84256c83c4e54b797", // سمبوسة جبن
    ],
  },
  {
    id: "cat_a6b6a688cdf54cb7b979",
    name: "معجنات",
    accent: "yellow",
    products: [
      "prod_8eae4e0d532b4cac948f", // لحم بعجين
      "prod_fa8648dc29c94243885f", // فطائر الجبن والكرفس
    ],
  },
  {
    id: "cat_c6718012709944319179",
    name: "حلويات",
    accent: "cream",
    products: [
      "prod_bd938fe4a97041dcb193", // كليچة
    ],
  },
];

/** Obvious typo fixes only. */
const RENAMES = {
  prod_fa8648dc29c94243885f: "فطائر الجبن والكرفس",
};

async function main() {
  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient();
  const keep = new Set(CATEGORIES.map((c) => c.id));
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  const mapped = new Set(CATEGORIES.flatMap((c) => c.products));
  const unmapped = allProducts.filter((p) => !mapped.has(p.id));
  if (unmapped.length) {
    throw new Error(
      `Products not in the new map: ${unmapped.map((p) => p.id).join(", ")}`,
    );
  }
  const others = await prisma.category.findMany({
    where: { id: { notIn: [...keep] } },
    orderBy: { sortOrder: "asc" },
  });

  const ops = [];
  CATEGORIES.forEach((cat, ci) => {
    ops.push(
      prisma.category.update({
        where: { id: cat.id },
        data: {
          name: cat.name,
          accent: cat.accent,
          visible: true,
          sortOrder: ci + 1,
        },
      }),
    );
    cat.products.forEach((pid, pi) => {
      ops.push(
        prisma.product.update({
          where: { id: pid },
          data: {
            categoryId: cat.id,
            sortOrder: pi + 1,
            ...(RENAMES[pid] ? { name: RENAMES[pid] } : {}),
          },
        }),
      );
    });
  });
  others.forEach((cat, i) => {
    ops.push(
      prisma.category.update({
        where: { id: cat.id },
        data: { visible: false, sortOrder: 100 + i },
      }),
    );
  });

  console.log(
    `${CATEGORIES.length} categories kept, ${mapped.size} products moved, ` +
      `${others.length} empty categories hidden (${others.map((c) => c.name).join(" | ")})`,
  );
  if (!apply) {
    console.log("Dry run — pass --apply to write.");
  } else {
    await prisma.$transaction(ops);
    console.log("Applied.");
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
