import { chromium } from "playwright";
import path from "path";

const out = path.resolve("docs/screenshots/phase-4a");
const sizes = [
  { name: "360", w: 360, h: 800 },
  { name: "390", w: 390, h: 844 },
  { name: "430", w: 430, h: 932 },
  { name: "768", w: 768, h: 1024 },
  { name: "1280", w: 1280, h: 900 },
];

const browser = await chromium.launch();
for (const s of sizes) {
  const page = await browser.newPage({
    viewport: { width: s.w, height: s.h },
  });
  await page.goto("http://127.0.0.1:3456/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(out, `home-${s.name}.png`),
    fullPage: true,
  });
  await page.close();
  console.log("saved", s.name);
}
await browser.close();
console.log("done");
