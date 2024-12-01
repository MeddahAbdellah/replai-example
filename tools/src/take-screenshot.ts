import { type Page } from "puppeteer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ToolContext } from "replai";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function takeScreenShot(context: ToolContext<{ page: Page }>) {
  const { page } = context.getContext();
  const filePath = "temp.png";
  const screenshotPath = path.join(__dirname, filePath);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const imageBuffer = fs.readFileSync(screenshotPath);
  const imageBase64 = imageBuffer.toString("base64");
  return [
    {
      type: "image_url",
      image_url: {
        url: `data:image/png;base64,${imageBase64}`,
      },
    },
  ];
}
