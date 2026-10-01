/**
 * One-off: wipe production catalog products/categories and seed the 3 new dishes.
 * Images live under apps/web/public/menu/ (served as /menu/*.png).
 * Usage: node --env-file=.env.vercel.local scripts/replace-production-menu.cjs
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

async function main() {
  const imgLahm = "/menu/lahm-bijin.png";
  const imgMansaf = "/menu/mansaf-dajaj.png";
  const imgSambusa = "/menu/sambusa-jibn.png";

  await prisma.$transaction(
    async (tx) => {
      console.log("Clearing catalog…");
      await tx.offerProduct.deleteMany({});
      await tx.reel.updateMany({ data: { productId: null } });
      await tx.productOption.deleteMany({});
      await tx.productOptionGroup.deleteMany({});
      await tx.product.deleteMany({});
      await tx.category.deleteMany({});

      const catPastry = {
        id: id("cat"),
        name: "معجنات – مخبوزات",
        accent: "yellow",
        href: "",
        visible: true,
        sortOrder: 1,
      };
      const catMains = {
        id: id("cat"),
        name: "أطباق رئيسية – أطباق عربية - ثريد وخبز",
        accent: "navy",
        href: "",
        visible: true,
        sortOrder: 2,
      };
      const catApps = {
        id: id("cat"),
        name: "مقبلات – معجنات مقلية",
        accent: "raspberry",
        href: "",
        visible: true,
        sortOrder: 3,
      };
      catPastry.href = `/menu?category=${catPastry.id}`;
      catMains.href = `/menu?category=${catMains.id}`;
      catApps.href = `/menu?category=${catApps.id}`;

      await tx.category.createMany({ data: [catPastry, catMains, catApps] });

      const now = new Date();

      await tx.product.create({
        data: {
          id: id("prod"),
          name: "لحم بعجين",
          description:
            "عجينة قطنية مغطاة بطبقة من اللحم المفروم المتبّل العراقي 100% ، تُخبز حتى تنضج وتتحمر بطعم غني وشهي",
          price: 750,
          categoryId: catPastry.id,
          imageSrc: imgLahm,
          imageAlt: "لحم بعجين",
          available: true,
          visible: true,
          sortOrder: 1,
          createdAt: now,
          updatedAt: now,
          optionGroups: {
            create: [
              {
                id: id("pog"),
                name: "النوع",
                selection: "SINGLE",
                required: true,
                sortOrder: 1,
                options: {
                  create: [
                    {
                      id: id("po"),
                      name: "بدون جبن",
                      priceDelta: 0,
                      available: true,
                      sortOrder: 1,
                    },
                    {
                      id: id("po"),
                      name: "بالجبن",
                      priceDelta: 250,
                      available: true,
                      sortOrder: 2,
                    },
                  ],
                },
              },
            ],
          },
        },
      });

      await tx.product.create({
        data: {
          id: id("prod"),
          name: "منسف دجاج",
          description:
            "تمن بسمتي بحبة طويلة يُقدّم مع قطع الدجاج المطهية بعناية، ويُزيّن بالمكسرات، مع انواع المرگات الاختيارية ( شجر -مركه باميا - تشريب احمر - تشريب اصفر ) حسب طلب",
          price: 10000,
          categoryId: catMains.id,
          imageSrc: imgMansaf,
          imageAlt: "منسف دجاج",
          available: true,
          visible: true,
          sortOrder: 1,
          createdAt: now,
          updatedAt: now,
          optionGroups: {
            create: [
              {
                id: id("pog"),
                name: "الحجم",
                selection: "SINGLE",
                required: true,
                sortOrder: 1,
                options: {
                  create: [
                    {
                      id: id("po"),
                      name: "نص دجاجة",
                      priceDelta: 0,
                      available: true,
                      sortOrder: 1,
                    },
                    {
                      id: id("po"),
                      name: "دجاجة كاملة",
                      priceDelta: 10000,
                      available: true,
                      sortOrder: 2,
                    },
                  ],
                },
              },
              {
                id: id("pog"),
                name: "المرقة",
                selection: "MULTI",
                required: false,
                sortOrder: 2,
                options: {
                  create: [
                    {
                      id: id("po"),
                      name: "شجر",
                      priceDelta: 0,
                      available: true,
                      sortOrder: 1,
                    },
                    {
                      id: id("po"),
                      name: "مرقة باميا",
                      priceDelta: 0,
                      available: true,
                      sortOrder: 2,
                    },
                    {
                      id: id("po"),
                      name: "تشريب أحمر",
                      priceDelta: 0,
                      available: true,
                      sortOrder: 3,
                    },
                    {
                      id: id("po"),
                      name: "تشريب أصفر",
                      priceDelta: 0,
                      available: true,
                      sortOrder: 4,
                    },
                  ],
                },
              },
            ],
          },
        },
      });

      await tx.product.create({
        data: {
          id: id("prod"),
          name: "سمبوسة جبن",
          description:
            "عجينة رقيقة ومقرمشة محشوة بمزيج من الجبن والكرفس الطازج، تُقلى حتى تكتسب لونًا ذهبيًا ونكهة شهية",
          price: 500,
          categoryId: catApps.id,
          imageSrc: imgSambusa,
          imageAlt: "سمبوسة جبن",
          available: true,
          visible: true,
          sortOrder: 1,
          createdAt: now,
          updatedAt: now,
        },
      });

      console.log("Seeded 3 products + 3 categories");
    },
    { maxWait: 15000, timeout: 60000 },
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
