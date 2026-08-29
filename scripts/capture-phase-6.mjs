import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const out = path.resolve("docs/screenshots/phase-6");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const shots = [
  { name: "menu-390", url: "/menu", w: 390, h: 844 },
  { name: "menu-1280", url: "/menu", w: 1280, h: 900 },
  { name: "product-390", url: "/product/mock-dolma", w: 390, h: 844 },
  { name: "cart-390", url: "/cart", w: 390, h: 844 },
];

for (const s of shots) {
  const page = await browser.newPage({
    viewport: { width: s.w, height: s.h },
  });
  await page.goto(`http://127.0.0.1:3456${s.url}`, {
    waitUntil: "networkidle",
  });

  if (s.name === "cart-390") {
    // Seed cart via localStorage then reload
    await page.evaluate(() => {
      localStorage.setItem(
        "koulshy-taib-cart",
        JSON.stringify({
          state: {
            items: [
              { productId: "mock-dolma", quantity: 2 },
              { productId: "mock-tashreeb", quantity: 1 },
            ],
          },
          version: 0,
        }),
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(400);
  } else {
    await page.waitForTimeout(400);
  }

  await page.screenshot({
    path: path.join(out, `${s.name}.png`),
    fullPage: true,
  });
  await page.close();
  console.log("saved", s.name);
}

await browser.close();
console.log("done");
