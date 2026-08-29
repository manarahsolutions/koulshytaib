import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const out = path.resolve("docs/screenshots/phase-8");
fs.mkdirSync(out, { recursive: true });
const base = "http://127.0.0.1:3456";
const now = new Date().toISOString();
const order = {
  id: "demo-opaque-id-not-shown",
  customer: { name: "أحمد", phone: "07701234567" },
  items: [
    {
      productId: "mock-dolma",
      name: "دولمة بيتنا",
      unitPrice: 12000,
      quantity: 2,
      lineTotal: 24000,
    },
    {
      productId: "mock-kebbeh",
      name: "كبة مقلية",
      unitPrice: 8000,
      quantity: 1,
      lineTotal: 8000,
    },
  ],
  delivery: {
    governorate: "بغداد",
    area: "المنصور",
    address: "شارع 14 رمضان",
  },
  payment: { method: "cash" },
  pricing: { subtotal: 32000, deliveryFee: 3000, total: 35000 },
  status: "received",
  statusHistory: [
    {
      status: "received",
      timestamp: now,
      note: "طلب ضيف — معاينة واجهة فقط",
    },
  ],
  createdAt: now,
};

const browser = await chromium.launch();

async function shot(name, width, height, route) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", (err) => console.log("PAGEERROR", name, err.message));
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((payload) => {
    sessionStorage.setItem(
      "koulshy-taib-active-order",
      JSON.stringify(payload),
    );
  }, order);
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const h1 = await page.locator("h1").first().textContent();
  console.log(name, "h1=", h1);
  await page.screenshot({ path: path.join(out, name), fullPage: true });
  await page.close();
}

await shot("success-390.png", 390, 844, "/orders/success");
await shot("success-1280.png", 1280, 900, "/orders/success");
await shot("tracking-390.png", 390, 844, "/orders/track");
await browser.close();
